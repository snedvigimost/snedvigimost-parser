import * as dayjs from 'dayjs';

require('dayjs/locale/ru');
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import {Dayjs} from "dayjs";
import puppeteer from 'puppeteer-extra';

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
import {ListingEntity} from "../entity/listing.entity";
import * as Puppeteer from "puppeteer-extra/dist/puppeteer";

import {ScraperInterface} from "./scraper-interface";
import {StorageInterface} from "../stor/storage-interface";

dayjs.locale('ru')
dayjs.extend(customParseFormat)
puppeteer.use(AdblockerPlugin())

export class OLX implements ScraperInterface {
  url: string;
  storage: StorageInterface;
  page: Puppeteer.Page;

  constructor(page: Puppeteer.Page, storage: StorageInterface, url: string) {
    this.url = url;
    this.page = page;
    this.storage = storage;
  }

  async getTitle(page: Puppeteer.Page): Promise<string> {
    return page.evaluate((selector) => document.querySelector(selector).innerText, 'h1');
  }

  async getPrice(page: Puppeteer.Page): Promise<number> {
    return page.evaluate(selector => {
      return Number(document.querySelector(selector).innerText
        .replace(' ', '').replace(' ', '')
        .replace('грн.', ''));
    }, '.pricelabel__value');
  }

  async showNumbers(page: Puppeteer.Page): Promise<void> {
    page.evaluate((descriptionSelector, profileSelector) => {
      document.querySelector(descriptionSelector).click()
      document.querySelector(profileSelector).click()
    }, '.showPhoneButton', '#contact_methods .link-phone');
  }

  async getPhoneNumber(page: Puppeteer.Page): Promise<string> {
    return page.evaluate(selector => {
      return document.querySelector(selector).innerText;
    }, '#contact_methods .link-phone > strong');
  }

  async getDescription(page: Puppeteer.Page): Promise<string> {
    return page.evaluate(selector => document.querySelector(selector).nextSibling.nextSibling.innerText,
      '.descriptioncontent__headline');
  }

  async getPublicationDate(page: Puppeteer.Page): Promise<Dayjs> {
    const dateString = await page.evaluate(selector => document.querySelector(selector).innerText
        .replace('в ', ''),
      '.offer-bottombar__item em strong');
    return dayjs(dateString, "HH:mm, DD MMMM YYYY");
  }

  async getMetadata(page: Puppeteer.Page): Promise<ListingEntity> {
    const listingEntity = await page.evaluate((selector) => {
      const elements = document.querySelectorAll(selector);
      const listing = {};
      for (const e of elements) {
        const text = e.childNodes[1].querySelector('strong').innerText;
        switch (e.childNodes[1].querySelector('span')?.innerText) {
          case 'Этаж':
            listing['floor'] = Number(text);
            break;
          case 'Этажность':
            listing['floor_in_house'] = Number(text);
            break;
          case 'Количество комнат':
            listing['rooms_count'] = Number(text);
            break;
          case 'Общая площадь':
            listing['total_area'] = Number(text.replace(' м²', ''));
            break;
          case 'Площадь кухни':
            listing['kitchen_area'] = Number(text.replace(' м²', ''));
            break;
          case 'Тип объекта':
            listing['type'] = text;
            break;
          default:
            console.log('This animal will not.');
            break;
        }
      }
      return listing;
    }, '.offer-details__item');
    return new ListingEntity(listingEntity as ListingEntity);
  }


  async getImagesUrls(page: Puppeteer.Page): Promise<string[]> {
    const getImageSrc = async () => await page.evaluate(() => document.querySelector('.bigImage').getAttribute('src'));
    const totalImages = await page.evaluate(
      () => Number(document.querySelector('.descgallery__counter')
        .getAttribute('data-to')
        .replace('0', '')));
    await page.waitFor(1200);
    const imagesUrl = [await getImageSrc()];
    for (const x of [...Array(totalImages - 1)]) {
      await page.click('.descgallery__next');
      imagesUrl.push(await getImageSrc());
      await this.page.waitForResponse(response => response.url().includes('https://ireland.apollo.olxcdn.com/v1/files') && response.status() === 200);
    }
    return imagesUrl;
  }

  async downloadImages(page: Puppeteer.Page) {
    const imagesUrl = await this.getImagesUrls(page);
    console.log(imagesUrl);
  }

  async scrape(): Promise<ListingEntity> {
    await this.page.goto(this.url, {timeout: 60000});
    await this.page.waitForSelector('.descgallery__next');
    const listingEntity = await this.getMetadata(this.page);
    const downloadImages = await this.downloadImages(this.page);
    // listingEntity.title = await this.getTitle(page);
    // listingEntity.price = await this.getPrice(page);
    // await this.showNumbers(page);
    // listingEntity.description = await this.getDescription(page);
    // listingEntity.publication_date = await this.getPublicationDate(page);
    // await page.waitFor(1000);
    // listingEntity.phone_number = await this.getPhoneNumber(page);
    return listingEntity;
  };

  async store() {
    const listingEntity = await this.scrape();
    try {
      const saved = await this.storage.save(listingEntity);
      console.log('');
      console.log(saved);
    } catch (e) {
      console.log(e);
    }
  }

}
