const axios = require('axios');

import {ListingEntity} from "../entity/listing.entity";
import {StorageInterface} from "./storage-interface";

export class ApiStorage implements StorageInterface {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  async save(listing: ListingEntity): Promise<ListingEntity> {
    return await axios.post(this.url, listing);
  }

}
