import {Connection} from "typeorm/connection/Connection";
import * as Puppeteer from "puppeteer-extra/dist/puppeteer";

import {ListingEntity} from "../entity/listing.entity";
import {ScraperInterface} from "./scraper-interface";

export class Ria implements ScraperInterface {
  url: string;
  connection: Connection;
  browser: Puppeteer.Browser;

  constructor(browser: Puppeteer.Browser, connection: Connection, url: string) {
    this.url = url;
    this.browser = browser;
    this.connection = connection;
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
    const page = await this.browser.newPage();
    await page.goto(this.url, {timeout: 60000});
    await page.waitForSelector('h1');
    const listingEntity = await new ListingEntity(await this.getMetadata(page));
    console.log(listingEntity);
    return listingEntity;
  };
}
