import * as Puppeteer from "puppeteer-extra/dist/puppeteer";
import {ListingEntity} from "../entity/listing.entity";
import {StorageInterface} from "../stor/storage-interface";

export interface ScraperInterface {
  url: string;
  storage: StorageInterface;
  browser: Puppeteer.Browser;

  getMetadata(page: Puppeteer.Page): Promise<ListingEntity>;

  scrape(): Promise<ListingEntity>;

}
