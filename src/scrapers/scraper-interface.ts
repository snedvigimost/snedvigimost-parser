import * as Puppeteer from "puppeteer";
import {ListingEntity} from "../entity/listing.entity";
import {StorageInterface} from "../stor/storage-interface";
import {Config} from "./config";

export interface ScraperInterface {
  config: Config;

  getMetadata(page: Puppeteer.Page): Promise<ListingEntity>;

  getDescription(page: Puppeteer.Page): Promise<string>;

  getTitle(page: Puppeteer.Page): Promise<string>;

  getPrice(page: Puppeteer.Page): Promise<number>;

  scrape(): Promise<ListingEntity>;

  uploadImages(listingEntity: ListingEntity);

}
