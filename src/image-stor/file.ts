import * as path from "path";
const fs = require('fs');
const fsPromises = fs.promises;

export class FileStorage {
  folder: string;

  constructor(folder: string) {
    this.folder = folder;
  }

  async save(imageFileName: string, file: Buffer) {
    try {
      const imagePath = path.join(this.folder, imageFileName);
      await fsPromises.writeFile(imagePath, file);
      console.log(`The ${imagePath} was saved!`);
    } catch (e) {
      console.log(e);
    }
  }
}
