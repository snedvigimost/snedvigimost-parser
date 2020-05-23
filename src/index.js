const { chromium } = require('playwright');

async function getTitle(page) {
  return page.evaluate(selector => document.querySelector(selector).innerText, 'h1');
}

async function getPrice(page) {
  return page.evaluate(selector => document.querySelector(selector).innerText, '.pricelabel__value');
}

async function showNumbers(page) {
  page.evaluate(selector => document.querySelector(selector).click(), '.showPhoneButton');
}

async function getDescription(page) {
  return page.evaluate(selector => document.querySelector(selector).nextSibling.nextSibling.innerText,
    '.descriptioncontent__headline');
}

async function getPublicationDate(page) {
  return page.evaluate(selector => document.querySelector(selector).innerText.replace('в', ''),
    '.offer-bottombar__item em strong');
}

async function getFloor(page) {
  return page.evaluate(selector => {
    const elements = document.querySelectorAll(selector);
    const metadata = {};
    for (const e of elements) {
      const text = e.childNodes[1].querySelector('strong').innerText;
      switch (e.childNodes[1].querySelector('span')?.innerText) {
        case 'Этаж':
          metadata['floor'] = text;
          break;
        case 'Этажность':
          metadata['floors'] = text;
          break;
        case 'Количество комнат':
          metadata['roomsCount'] = text;
          break;
        case 'Общая площадь':
          metadata['totalArea'] = text.replace(' м²', '');
          break;
        case 'Площадь кухни':
          metadata['kitchenArea'] = text.replace(' м²', '');
          break;
        case 'Тип объекта':
          metadata['type'] = text;
          break;
        default:
          console.log('This animal will not.');
          break;
      }
    }
    return metadata;
  }, '.offer-details__item');
}


(async () => {
  const browser = await chromium.launch({ headless: false});
  const page = await browser.newPage();
  await page.goto(
    'https://www.olx.ua/obyavlenie/bez-komissii-sdam-svoyu-3-h-komnatnuyu-kvartiru-IDHmsXk.html',
  );
  await page.waitForSelector('h1');
  const title = await getTitle(page);
  const price = await getPrice(page);
  const floor = await getFloor(page);
  console.log(title);
  console.log(price);
  console.log(floor);
  await showNumbers(page);
  const description = await getDescription(page);
  console.log(description);
  const publicationDate = await getPublicationDate(page);
  console.log(publicationDate);
})();
