import "reflect-metadata";

import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({
  name: 'images_image'
})
export class ImageEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 200 })
  photo: string;

  constructor(photo?: string) {
    this.photo = photo;
  }
}
