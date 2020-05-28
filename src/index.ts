import {OLX} from "./scrapers/olx";
import {ConnectionOptions, createConnection} from "typeorm";
import {Ria} from "./scrapers/ria";
import {ListingEntity} from "./entity/listing.entity";
import {ImageEntity} from "./entity/image.entity";

const puppeteer = require('puppeteer');

(async () => {
  // const browser = await puppeteer.launch({headless: false});
  const connection = await createConnection();
  // const url = 'https://www.olx.ua/obyavlenie/bez-komissii-sdam-svoyu-3-h-komnatnuyu-kvartiru-IDHmsXk.html';
  // // const url = 'https://dom.ria.com/ru/realty-dolgosrochnaya -arenda-kvartira-cherkassy-tsentr-17133629.html';
  // const olx = new OLX(browser, connection, url);
  // // const olx = new Ria(browser, connection, url);
  // // await olx.scrape();
  // await olx.store();
  const image = new ImageEntity('path');
  await connection.manager.save(image);
  const listing = new ListingEntity();
  listing.images = [image];
  await connection.manager.save(listing);

})();
