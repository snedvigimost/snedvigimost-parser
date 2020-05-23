import "reflect-metadata";

import {createConnection, getConnection} from "typeorm";

const puppeteer = require('puppeteer-extra')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')

import {Listing} from "./entity/listing";
import * as conn from "./listing_con";
import {ListingEntity} from "./entity/listing.entity";
import {ListingMetadata} from "./entity/listing-metadata";
import {DBConfig} from "./listing_con";

puppeteer.use(AdblockerPlugin())

async function getTitle(page) {
  return page.evaluate((selector) => document.querySelector(selector).innerText, 'h1');
}

async function getPrice(page): Promise<number> {
  return page.evaluate(selector => {
    return Number(document.querySelector(selector).innerText
      .replace(' ', '').replace(' ', '')
      .replace('грн.', ''));
  }, '.pricelabel__value');
}

async function showNumbers(page) {
  page.evaluate((descriptionSelector, profileSelector) => {
    document.querySelector(descriptionSelector).click()
    document.querySelector(profileSelector).click()
  }, '.showPhoneButton', '#contact_methods .link-phone');
}

async function getPhoneNumber(page) {
  return page.evaluate(selector => {
    return document.querySelector(selector).innerText;
  }, '#contact_methods .link-phone > strong');
}

async function getDescription(page) {
  return page.evaluate(selector => document.querySelector(selector).nextSibling.nextSibling.innerText,
    '.descriptioncontent__headline');
}

async function getPublicationDate(page) {
  return page.evaluate(selector => document.querySelector(selector).innerText.replace('в ', ''),
    '.offer-bottombar__item em strong');
}

async function getMetadata(page) {
  const listingMetadata = new ListingMetadata();
  return page.evaluate((selector, listingMetadata: ListingMetadata) => {
    console.log(listingMetadata);
    const elements = document.querySelectorAll(selector);
    for (const e of elements) {
      const text = e.childNodes[1].querySelector('strong').innerText;
      switch (e.childNodes[1].querySelector('span')?.innerText) {
        case 'Этаж':
          listingMetadata.floor = Number(text);
          // metadata['floor'] = text;
          break;
        case 'Этажность':
          listingMetadata.floor_in_house = Number(text);
          // metadata['floor_in_house'] = text;
          break;
        case 'Количество комнат':
          listingMetadata.rooms_count = Number(text);
          // metadata['rooms_count'] = text;
          break;
        case 'Общая площадь':
          listingMetadata.total_area = Number(text.replace(' м²', ''));
          // metadata['total_area'] = text.replace(' м²', '');
          break;
        case 'Площадь кухни':
          listingMetadata.kitchen_area = Number(text.replace(' м²', ''));
          // metadata['kitchen_area'] = text.replace(' м²', '');
          break;
        case 'Тип объекта':
          listingMetadata.type = text;
          // metadata['type'] = text;
          break;
        default:
          console.log('This animal will not.');
          break;
      }
    }
    return listingMetadata;
  }, '.offer-details__item', listingMetadata);
}


(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(
    'https://www.olx.ua/obyavlenie/bez-komissii-sdam-svoyu-3-h-komnatnuyu-kvartiru-IDHmsXk.html',
  );
  await page.waitForSelector('h1');
  const metadata = await getMetadata(page);
  const listing = await new Listing(metadata);
  listing.title = await getTitle(page);
  listing.price = await getPrice(page);
  await showNumbers(page);
  listing.description = await getDescription(page);
  listing.publication_date = await getPublicationDate(page);
  await page.waitFor(1000);
  listing.phone_number = await getPhoneNumber(page);
  console.log(listing);
  const listingEntity = await new ListingEntity(listing);
  const connection = await createConnection(DBConfig);
  try {
    const saved = await connection.manager.save(listingEntity);
    console.log('');
    console.log(saved);
  } catch (e) {
    console.log(e);
  }
})();
