import {Connection} from "typeorm/connection/Connection";

import {ListingEntity} from "../entity/listing.entity";
import {StorageInterface} from "./storage-interface";

export class DatabaseStorage implements StorageInterface {
  connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async save(listing: any): Promise<any> {
    return await this.connection.manager.save(listing);
  }
}
