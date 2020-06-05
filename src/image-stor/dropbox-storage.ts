import * as path from "path";
const fs = require('fs');

require('dotenv').config();
const fetch = require('isomorphic-fetch');
const Dropbox = require('dropbox').Dropbox;

const dbx = new Dropbox({accessToken: process.env.DROPBOX_TOKEN, fetch: fetch});
const fsPromises = fs.promises;

export class DropboxStorage {
  folder: string;

  constructor(folder: string) {
    this.folder = folder;
  }

  async save(imagePath: string, destFIleName) {
     try {
       const data = await fsPromises.readFile(imagePath);
       const uploadPath = path.join(this.folder, destFIleName);
       return await dbx.filesUpload({path: uploadPath, contents: data});
     } catch (e) {
       console.log(e);
     }
  }

}
