import * as path from "path";

import * as dayjs from 'dayjs';

require('dayjs/locale/ru');
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import {Dayjs} from "dayjs";
import * as Puppeteer from "puppeteer-extra/dist/puppeteer";

import {FileStorage} from "../stor/file";
import {ListingEntity} from "../entity/listing.entity";

import {ScraperInterface} from "./scraper-interface";
import {StorageInterface} from "../stor/storage-interface";

dayjs.locale('ru')
dayjs.extend(customParseFormat)

export class OLX implements ScraperInterface {
  url: string;
  isLastImage = false;
  page: Puppeteer.Page;
  fileStorage: FileStorage;
  storage: StorageInterface;
  storedImagePaths: string[] = [];

  constructor(page: Puppeteer.Page, storage: StorageInterface, url: string, fileStorage: FileStorage) {
    this.url = url;
    this.page = page;
    this.storage = storage;
    this.fileStorage = fileStorage;
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
    await page.evaluate((descriptionSelector, profileSelector) => {
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
          case 'Объявление от':
            listing['publisher_type'] = text;
            break;
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

  async uploadImages() {
    console.log(this.storedImagePaths);
  }

  async slideImages(page: Puppeteer.Page) {
    const totalImages = await page.evaluate(
      () => Number(document.querySelector('.descgallery__counter')
        .getAttribute('data-to')
        .replace('0', '')));
    // TODO: make something with it
    await page.waitFor(5000);
    for await (const x of [...Array(totalImages - 1)]) {
      await page.click('.descImageNext');
      console.log('click');
      // without that on('response', dont run
      await this.page.waitForResponse(response => response.url().includes(';s=1000x700') && response.status() === 200);
    }
    /*
     if replace that with await this.uploadImages(); last item will not be pushed to list
     so firstly called waitForResponse than on('response',
    */
    this.isLastImage = true;
  }

  async interceptImages() {
    await this.page.on('response', async (response) => {
      if (response.url().includes(';s=1000x700') && response.status() === 200) {
        const imageFileName = `${new URL(response.url()).pathname.split('/')[3]}.jpeg`;
        const imagePath = path.join('images', imageFileName);
        await this.fileStorage.save(imagePath, await response.buffer());
        this.storedImagePaths.push(imagePath);
        if (this.isLastImage) {
          await this.uploadImages();
        }
      }
    });
  }

  isPrivatePerson(listingEntity: ListingEntity) {
    return listingEntity.publisher_type === 'Частного лица';
  }

  async scrape(): Promise<ListingEntity> {
    await this.interceptImages();
    await this.page.goto(this.url, {timeout: 60000});
    const listingEntity = await this.getMetadata(this.page);
    // TODO: maybe better to raise custom exception
    if (!this.isPrivatePerson(listingEntity)) {
      return listingEntity;
    }
    await this.slideImages(this.page);
    listingEntity.title = await this.getTitle(this.page);
    listingEntity.price = await this.getPrice(this.page);
    await this.showNumbers(this.page);
    listingEntity.description = await this.getDescription(this.page);
    listingEntity.publication_date = await this.getPublicationDate(this.page);
    await this.page.waitFor(1000);
    listingEntity.phone_number = await this.getPhoneNumber(this.page);
    return listingEntity;
  };

  async store() {
    const listingEntity = await this.scrape();
    if (this.isPrivatePerson(listingEntity)) {
      try {
        const saved = await this.storage.save(listingEntity);
        console.log('saved');
        console.log(saved);
        return false;
      } catch (e) {
        console.log(e);
        return false;
      }
    } else {
      console.log('data not saved cause person os not private');
      return false;
    }

  }

}
