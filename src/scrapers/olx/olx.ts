import * as path from "path";

import * as dayjs from 'dayjs';

require('dayjs/locale/ru');
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import {Dayjs} from "dayjs";
import * as Puppeteer from "puppeteer-extra/dist/puppeteer";

import {FileStorage} from "../../image-stor/file";
import {ListingEntity} from "../../entity/listing.entity";

import {ScraperInterface} from "../scraper-interface";
import {StorageInterface} from "../../stor/storage-interface";
import {DropboxStorage} from "../../image-stor/dropbox-storage";
import {ImageEntity} from "../../entity/image.entity";
import {Config} from "../config";

dayjs.locale('ru')
dayjs.extend(customParseFormat)

export class OLX implements ScraperInterface {
  config: Config;
  source = 'olx';
  storedImagePaths: string[] = [];

  constructor(config: Config) {
    this.config = config;
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
      document.querySelector(profileSelector).click()
      try {
         document.querySelector(descriptionSelector).click()
      } catch (e) {
        console.log('no number in description');
      }
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

  async uploadImages(listingEntity: ListingEntity) {
    const imageEntities = [];
    for (const imagePath of this.storedImagePaths) {
      const image = new ImageEntity(path.join(this.config.uploader.folder, imagePath));
      await this.config.storage.save(image);
      const uploadResponse = await this.config.uploader.save(path.join(this.config.fileStorage.folder, imagePath), imagePath);
      console.log(uploadResponse);
      imageEntities.push(image);
    }
    listingEntity.images = imageEntities;
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
      // without that on('response', dont run
      await this.config.page.waitForResponse(
        response => response.url().includes(';s=1000x700')
          && response.status() === 200
      );
    }
  }

  interceptImages = async (interceptedResponse) => {
    if (interceptedResponse.url().includes(';s=1000x700') && interceptedResponse.status() === 200) {
      const imageFileName = `${new URL(interceptedResponse.url()).pathname.split('/')[3]}.jpeg`;
      console.log(this.config.fileStorage);
      await this.config.fileStorage.save(imageFileName, await interceptedResponse.buffer());
      this.storedImagePaths.push(imageFileName);
    }
  }

  isPrivatePerson(listingEntity: ListingEntity) {
    return listingEntity.publisher_type === 'Частного лица';
  }

  async scrape(): Promise<ListingEntity> {
    this.config.page.on('response', this.interceptImages);

    await this.config.page.goto(this.config.url, {timeout: 60000});
    const listingEntity = await this.getMetadata(this.config.page);
    // TODO: maybe better to raise custom exception
    if (!this.isPrivatePerson(listingEntity)) {
      return listingEntity;
    }
    listingEntity.source = this.source;
    listingEntity.url = this.config.url;
    await this.slideImages(this.config.page);
    // TODO: better way for waiting last image
    await this.config.page.waitFor(1000);
    await this.uploadImages(listingEntity);
    listingEntity.title = await this.getTitle(this.config.page);
    listingEntity.price = await this.getPrice(this.config.page);
    await this.showNumbers(this.config.page);
    listingEntity.description = await this.getDescription(this.config.page);
    listingEntity.publication_date = await this.getPublicationDate(this.config.page);
    await this.config.page.waitFor(1000);
    listingEntity.phone_number = await this.getPhoneNumber(this.config.page);

    this.config.page.removeListener('response', this.interceptImages);
    return listingEntity;
  };

  async store() {
    const listingEntity = await this.scrape();
    if (this.isPrivatePerson(listingEntity)) {
      try {
        const saved = await this.config.storage.save(listingEntity);
        console.log('saved');
        console.log(saved);
        return false;
      } catch (e) {
        console.log(e);
        return false;
      }
    } else {
      console.log('data not saved cause person is not private');
      return false;
    }

  }

}