import {OLX} from "./scrapers/olx";
import {ConnectionOptions, createConnection} from "typeorm";
import {Ria} from "./scrapers/ria";
import {ListingEntity} from "./entity/listing.entity";
import {ImageEntity} from "./entity/image.entity";
import {ApiStorage} from "./stor/api";
import {DatabaseStorage} from "./stor/database";
const axios = require('axios');

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
  // const image = new ImageEntity('path');
  // await connection.manager.save(image);
  const listing = new ListingEntity();
  console.log(listing);
  // console.log(new ApiStorage('http://127.0.0.1:4222/api/v1/listings/').save(listing));
  console.log(new DatabaseStorage(connection).save(listing));
  // listing.images = [image];
  // await connection.manager.save(listing);

})();
