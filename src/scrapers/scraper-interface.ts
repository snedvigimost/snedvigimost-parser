import {Connection} from "typeorm/connection/Connection";
import * as Puppeteer from "puppeteer-extra/dist/puppeteer";
import {ListingEntity} from "../entity/listing.entity";

export interface ScraperInterface {
  url: string;
  connection: Connection;
  browser: Puppeteer.Browser;

  getMetadata(page: Puppeteer.Page): Promise<ListingEntity>;

  scrape(): Promise<ListingEntity>

}
