import "reflect-metadata";

import * as dayjs from 'dayjs';

require('dayjs/locale/ru');
import {createConnection} from "typeorm";
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import {Dayjs} from "dayjs";
import puppeteer from 'puppeteer-extra';

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
import {ListingEntity} from "./entity/listing.entity";

dayjs.locale('ru')
dayjs.extend(customParseFormat)
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

async function getPublicationDate(page): Promise<Dayjs> {
  const dateString = await page.evaluate(selector => document.querySelector(selector).innerText
      .replace('в ', ''),
    '.offer-bottombar__item em strong');
  return dayjs(dateString, "HH:mm, DD MMMM YYYY");
}

async function getMetadata(page): Promise<ListingEntity> {
  const listingEntity = new ListingEntity();
  return page.evaluate((selector, listing) => {
    const elements = document.querySelectorAll(selector);
    for (const e of elements) {
      const text = e.childNodes[1].querySelector('strong').innerText;
      switch (e.childNodes[1].querySelector('span')?.innerText) {
        case 'Этаж':
          listing.floor = Number(text);
          // metadata['floor'] = text;
          break;
        case 'Этажность':
          listing.floor_in_house = Number(text);
          // metadata['floor_in_house'] = text;
          break;
        case 'Количество комнат':
          listing.rooms_count = Number(text);
          // metadata['rooms_count'] = text;
          break;
        case 'Общая площадь':
          listing.total_area = Number(text.replace(' м²', ''));
          // metadata['total_area'] = text.replace(' м²', '');
          break;
        case 'Площадь кухни':
          listing.kitchen_area = Number(text.replace(' м²', ''));
          // metadata['kitchen_area'] = text.replace(' м²', '');
          break;
        case 'Тип объекта':
          listing.type = text;
          // metadata['type'] = text;
          break;
        default:
          console.log('This animal will not.');
          break;
      }
    }
    return listing;
  }, '.offer-details__item', listingEntity);
}


(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(
    'https://www.olx.ua/obyavlenie/bez-komissii-sdam-svoyu-3-h-komnatnuyu-kvartiru-IDHmsXk.html',
  );
  await page.waitForSelector('h1');
  const listingEntity = await new ListingEntity(await getMetadata(page));
  listingEntity.title = await getTitle(page);
  listingEntity.price = await getPrice(page);
  await showNumbers(page);
  listingEntity.description = await getDescription(page);
  listingEntity.publication_date = await getPublicationDate(page);
  await page.waitFor(1000);
  listingEntity.phone_number = await getPhoneNumber(page);
  console.log(listingEntity);
  const connection = await createConnection();
  try {
    const saved = await connection.manager.save(listingEntity);
    console.log('');
    console.log(saved);
  } catch (e) {
    console.log(e);
  }
})();
