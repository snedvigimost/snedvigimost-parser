import {OLX} from "./scrapers/olx";
import {ConnectionOptions, createConnection} from "typeorm";
import {Ria} from "./scrapers/ria";
import {ListingEntity} from "./entity/listing.entity";
import {ImageEntity} from "./entity/image.entity";
import {ApiStorage} from "./stor/api";
import {DatabaseStorage} from "./stor/database";
import {FileStorage} from "./stor/file";
const axios = require('axios');

const puppeteer = require('puppeteer');
// const puppeteer = require('puppeteer-extra')

// Add adblocker plugin, which will transparently block ads in all pages you
// create using puppeteer.
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
// puppeteer.use(AdblockerPlugin())

(async () => {
  const browser = await puppeteer.launch({headless: false, args: ['--start-maximized', '--window-size=1910,1000']});
  const page = await browser.newPage();
  await page.setViewport({ width: 0, height: 0 });
  const connection = await createConnection();
  // const url = 'https://www.olx.ua/obyavlenie/bez-komissii-sdam-svoyu-3-h-komnatnuyu-kvartiru-IDHmsXk.html';
  // not private person
  const url = 'https://www.olx.ua/obyavlenie/sevastopolskaya-pl-ernsta-16-spalnya-studiya-v-prestizhnom-dome-IDI6UUO.html#d0a51f9bff;promoted';
  // // const url = 'https://dom.ria.com/ru/realty-dolgosrochnaya -arenda-kvartira-cherkassy-tsentr-17133629.html';
  const fileStorage = new FileStorage();
  const olx = new OLX(page, new DatabaseStorage(connection), url, fileStorage);
  // // const olx = new Ria(browser, connection, url);
  // console.log(await olx.scrape());
  await olx.store();
  // const image = new ImageEntity('path');
  // await connection.manager.save(image);
  // const listing = new ListingEntity();
  // console.log(listing);
  // console.log(new ApiStorage('http://127.0.0.1:4222/api/v1/listings/').save(listing));
  // console.log(new DatabaseStorage(connection).save(listing));
  // listing.images = [image];
  // await connection.manager.save(listing);

})();
