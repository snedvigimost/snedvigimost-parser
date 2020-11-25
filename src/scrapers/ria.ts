import * as Puppeteer from "puppeteer";

import {ListingEntity} from "../entity/listing.entity";
import {ScraperInterface} from "./scraper-interface";
import {StorageInterface} from "../stor/storage-interface";

export class Ria implements ScraperInterface {
  url: string;
  page: Puppeteer.Page;
  storage: StorageInterface;

  constructor(page: Puppeteer.Page, storage: StorageInterface, url: string) {
    this.url = url;
    this.page = page;
    this.storage = storage;
  }

  async getMetadata(page: Puppeteer.Page): Promise<ListingEntity> {
    const listingEntity = await page.evaluate((selector) => {
      const elements = document.querySelectorAll(selector);
      const listing = {};
      for (const e of elements) {
        const text = e.childNodes[2].innerText.trim();
        switch (e.childNodes[0].innerText.trim()) {
          case 'Этажность':
            listing['floor_in_house'] = Number(text);
            break;
          default:
            console.log('This animal will not.');
            break;
        }
      }
      return listing;
    }, '#description > div.description > div:nth-child(3) li');
    return new ListingEntity(listingEntity as ListingEntity);
  }

  async scrape(): Promise<ListingEntity> {
    await this.page.goto(this.url, {timeout: 60000});
    await this.page.waitForSelector('h1');
    const listingEntity = await new ListingEntity(await this.getMetadata(this.page));
    console.log(listingEntity);
    return listingEntity;
  };
}
