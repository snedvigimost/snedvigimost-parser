// import "reflect-metadata";
import {OLX} from "./olx";
import {ConnectionOptions, createConnection} from "typeorm";

const puppeteer = require('puppeteer');

export const DBConfig: ConnectionOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "18091997",
  database: "real",
  entities: [
    __dirname + '/entity/*.entity{.ts,.js}'
  ],
  synchronize: false,
};


(async () => {
  const browser = await puppeteer.launch({headless: false});
  const connection = await createConnection(DBConfig);
  const url = 'https://www.olx.ua/obyavlenie/bez-komissii-sdam-svoyu-3-h-komnatnuyu-kvartiru-IDHmsXk.html';
  const olx = new OLX(browser, connection, url);
  await olx.store();
})();
