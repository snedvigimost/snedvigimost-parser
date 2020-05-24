import "reflect-metadata";

import * as dayjs from 'dayjs';

require('dayjs/locale/ru');
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import {Dayjs} from "dayjs";
import puppeteer from 'puppeteer-extra';

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
import {ListingEntity} from "./entity/listing.entity";
import * as Puppeteer from "puppeteer-extra/dist/puppeteer";
import {Connection} from "typeorm/connection/Connection";

dayjs.locale('ru')
dayjs.extend(customParseFormat)
puppeteer.use(AdblockerPlugin())

export class OLX {
  url: string;
  connection: Connection;
  browser: Puppeteer.Browser;

  constructor(browser: Puppeteer.Browser, connection: Connection, url: string) {
    this.url = url;
    this.browser = browser;
    this.connection = connection;
  }

  async getTitle(page): Promise<string> {
    return page.evaluate((selector) => document.querySelector(selector).innerText, 'h1');
  }

  async getPrice(page): Promise<number> {
    return page.evaluate(selector => {
      return Number(document.querySelector(selector).innerText
        .replace(' ', '').replace(' ', '')
        .replace('грн.', ''));
    }, '.pricelabel__value');
  }

  async showNumbers(page): Promise<void> {
    page.evaluate((descriptionSelector, profileSelector) => {
      document.querySelector(descriptionSelector).click()
      document.querySelector(profileSelector).click()
    }, '.showPhoneButton', '#contact_methods .link-phone');
  }

  async getPhoneNumber(page): Promise<string> {
    return page.evaluate(selector => {
      return document.querySelector(selector).innerText;
    }, '#contact_methods .link-phone > strong');
  }

  async getDescription(page): Promise<string> {
    return page.evaluate(selector => document.querySelector(selector).nextSibling.nextSibling.innerText,
      '.descriptioncontent__headline');
  }

  async getPublicationDate(page): Promise<Dayjs> {
    const dateString = await page.evaluate(selector => document.querySelector(selector).innerText
        .replace('в ', ''),
      '.offer-bottombar__item em strong');
    return dayjs(dateString, "HH:mm, DD MMMM YYYY");
  }

  async getMetadata(page): Promise<ListingEntity> {
    const listingEntity = new ListingEntity();
    return page.evaluate((selector, listing) => {
      const elements = document.querySelectorAll(selector);
      for (const e of elements) {
        const text = e.childNodes[1].querySelector('strong').innerText;
        switch (e.childNodes[1].querySelector('span')?.innerText) {
          case 'Этаж':
            listing.floor = Number(text);
            break;
          case 'Этажность':
            listing.floor_in_house = Number(text);
            break;
          case 'Количество комнат':
            listing.rooms_count = Number(text);
            break;
          case 'Общая площадь':
            listing.total_area = Number(text.replace(' м²', ''));
            break;
          case 'Площадь кухни':
            listing.kitchen_area = Number(text.replace(' м²', ''));
            break;
          case 'Тип объекта':
            listing.type = text;
            break;
          default:
            console.log('This animal will not.');
            break;
        }
      }
      return listing;
    }, '.offer-details__item', listingEntity);
  }

  async scrape(): Promise<ListingEntity> {
    const page = await this.browser.newPage();
    await page.goto(this.url, {timeout: 60000});
    await page.waitForSelector('h1');
    const listingEntity = await new ListingEntity(await this.getMetadata(page));
    listingEntity.title = await this.getTitle(page);
    listingEntity.price = await this.getPrice(page);
    await this.showNumbers(page);
    listingEntity.description = await this.getDescription(page);
    listingEntity.publication_date = await this.getPublicationDate(page);
    await page.waitFor(1000);
    listingEntity.phone_number = await this.getPhoneNumber(page);
    return listingEntity;
  };

  async store() {
    const listingEntity = await this.scrape();
     try {
      const saved = await this.connection.manager.save(listingEntity);
      console.log('');
      console.log(saved);
    } catch (e) {
      console.log(e);
    }
  }

}

