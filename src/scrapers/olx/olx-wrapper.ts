import * as Puppeteer from "puppeteer";

import {OLX} from "./olx";
import {Config} from "../config";
import {ListingEntity} from "../../entity/listing.entity";

const signale = require('signale');
const cliProgress = require('cli-progress');
const _colors = require('colors');

export class OlxWrapper {
  config: Config;
  alreadyParsedUrls: string[] = [];
  pagination = 'https://www.olx.ua/nedvizhimost/kvartiry-komnaty/arenda-kvartir-komnat/kiev/';

  constructor(config: Config) {
    this.config = config;
    this.config.page.goto(this.pagination).then(() => {
    });
    ListingEntity.find().then(listings => {
      this.alreadyParsedUrls = listings.map(listing => listing.url).filter(Boolean);
    });
  }

  async getAllUrls(page: Puppeteer.Page, selector: string) {
    return await page.evaluate((selector) => {
      const urls = [];
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        urls.push(element.getAttribute('href'));
      }
      return urls;
    }, selector);
  }

  async parsePageable() {
    const IMAGE_URL_SELECTOR = '#offers_table tr.wrap td > a';
    await this.config.page.waitForSelector(IMAGE_URL_SELECTOR);
    const allUrls = await this.getAllUrls(this.config.page, IMAGE_URL_SELECTOR);
    const itemPage = await this.config.browser.newPage();
    const itemPageConfig = {...this.config, ...{page: itemPage}};
    await itemPage.setViewport({width: 0, height: 0});

    const pb = new cliProgress.SingleBar({
      format: 'Items per page |' + _colors.cyan('{bar}') + '| {percentage}% || {value}/{total}',
    }, cliProgress.Presets.shades_classic);
    pb.start(allUrls.length, 0);

    for (const url of allUrls) {
      if (this.alreadyParsedUrls.includes(url)) {
        console.log('');
        signale.debug(`${url} already scrapped`);
        return;
      }
      const olx = new OLX({...itemPageConfig, url});
      await olx.store();
      pb.increment();
      // await sleep(100);
    }
    pb.stop();
    console.log(allUrls);
    await this.config.page.bringToFront();
    const NEXT_PAGE_SELECTOR = '#body-container div.pager.rel.clr > span.next a';
    try {
      await this.config.page.click(NEXT_PAGE_SELECTOR);
      await this.parsePageable();
    } catch (e) {
      console.log(e);
      return;
    }

  }

}
