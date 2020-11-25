import {OLX} from "./scrapers/olx/olx";
import {ConnectionOptions, createConnection} from "typeorm";
import {Ria} from "./scrapers/ria";
import {ListingEntity} from "./entity/listing.entity";
import {ImageEntity} from "./entity/image.entity";
import {ApiStorage} from "./stor/api";

const schedule = require('node-schedule');
import {DatabaseStorage} from "./stor/database";
import {FileStorage} from "./image-stor/file";
import {DropboxStorage} from "./image-stor/dropbox-storage";

const puppeteer = require('puppeteer');
import * as Puppeteer from "puppeteer";
import {Config} from "./scrapers/config";
import {OlxWrapper} from "./scrapers/olx/olx-wrapper";

// Add adblocker plugin, which will transparently block ads in all pages you
// create using puppeteer.
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
// puppeteer.use(AdblockerPlugin())

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

(async () => {
  const browser = await puppeteer.launch({headless: false, args: ['--start-maximized', '--window-size=1910,1000']});
  const page = await browser.newPage();
  await page.setViewport({width: 0, height: 0});
  const connection = await createConnection();
  // const url = 'https://www.olx.ua/obyavlenie/bez-komissii-sdam-svoyu-3-h-komnatnuyu-kvartiru-IDHmsXk.html';
  // not private person
  // const url = 'https://www.olx.ua/obyfileStorageavlenie/sevastopolskaya-pl-ernsta-16-spalnya-studiya-v-prestizhnom-dome-IDI6UUO.html#d0a51f9bff;promoted';
  // const url = 'https://dom.ria.com/ru/realty-dolgosrochnaya -arenda-kvartira-cherkassy-tsentr-17133629.html';
  const url = 'https://www.olx.ua/obyavlenie/sdaetsya-komnata-v-2-h-komn-pr-svobody-podolskiy-r-n-IDJ4Fg2.html#198eafd9aa';
  // const url = 'https://www.olx.ua/obyavlenie/sdam-1k-kvartiru-metro-obolon-IDJVfcJ.html#198eafd9aa';


  const fileStorage = new FileStorage('images');
  const dropboxStorage = new DropboxStorage('/photos');
  const databaseStorage = new DatabaseStorage(connection)
  const config: Config = {
    browser: browser,
    page: page,
    storage: databaseStorage,
    url: url,
    fileStorage: fileStorage,
    uploader: dropboxStorage,
  }

  // const olx = new OlxWrapper(config);
  // await olx.parsePageable();

  // schedule.scheduleJob('0 * * * *', async () => {
  //   console.log('run scheduleJob');
  //   await olx.parsePageable();
  // });

  // console.log(allUrls);

  const olx = new OLX(config);
  await olx.store();

  // // const olx = new Ria(browser, connection, url);
  // console.log(await olx.scrape());
  // await olx.store();
  // const image = new ImageEntity('path');
  // await connection.manager.save(image);
  // const listing = new ListingEntity();
  // console.log(listing);
  // console.log(new ApiStorage('http://127.0.0.1:4222/api/v1/listings/').save(listing));
  // console.log(new DatabaseStorage(connection).save(listing));
  // listing.images = [image];
  // await connection.manager.save(listing);

})();
