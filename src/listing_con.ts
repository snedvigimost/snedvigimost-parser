import "reflect-metadata";
import { createConnection } from "typeorm";
import { ConnectionOptions } from "typeorm/connection/ConnectionOptions";

import {ListingEntity} from "./entity/listing.entity";

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
  try {
    const connection = await createConnection(DBConfig);
    console.log(connection);
  } catch (e) {
    console.log(e);
  }
})();


// (async () => {
//   try {
//     const connection = await createConnection(DBConfig);
//     let photo = new ListingEntity();
//     photo.title = "Me and Bears";
//
//     const saved = await connection.manager.save(photo);
//     console.log("Photo has been saved. Photo id is", saved.id);
//   } catch (e) {
//     console.log(e);
//   }
// })();
