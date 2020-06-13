import * as Puppeteer from "puppeteer-extra/dist/puppeteer";

import {FileStorage} from "../image-stor/file";
import {DropboxStorage} from "../image-stor/dropbox-storage";
import {StorageInterface} from "../stor/storage-interface";

export interface Config {
  page: Puppeteer.Page,
  browser: Puppeteer.Browser,
  storage: StorageInterface,
  url: string,
  fileStorage: FileStorage,
  uploader: DropboxStorage,
}
