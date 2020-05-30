const fs = require('fs');
const fsPromises = fs.promises;

export class FileStorage {

  async save(imagePath: string, file: Buffer) {
    try {
      await fsPromises.writeFile(imagePath, file);
      console.log(`The ${imagePath} was saved!`);
    } catch (e) {
      console.log(e);
    }
  }
}
