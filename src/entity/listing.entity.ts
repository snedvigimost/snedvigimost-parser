import "reflect-metadata";

import {Dayjs} from "dayjs";
import {Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany} from "typeorm";

import {ImageEntity} from "./image.entity";

@Entity({
  name: 'listings_listing'
})
export class ListingEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  title: string;

  @Column("text")
  address: string;

  @Column("text")
  url: string;

  @Column("text")
  source: string;

  publisher_type: string;

  @Column("int")
  year: number;

  @Column("text")
  description: string;

  @Column("text")
  phone_number: string;

  @Column("int")
  price: number;

  @Column("int")
  rooms_count: number;

  @Column("int")
  total_area: number;

  @Column("int")
  living_area: number;

  @Column("int")
  kitchen_area: number;

  @Column("int")
  floor: number;

  @Column("int")
  floor_in_house: number;

  @Column("timestamp")
  publication_date: Dayjs;

  @ManyToMany(() => ImageEntity)
  @JoinTable({
    name: 'listings_listing_images',
    joinColumns: [
      {name: 'listing_id'}
    ],
    inverseJoinColumns: [
      {name: 'image_id'}
    ]
  })
  images: ImageEntity[];

  // @Column("text")
  // type: string;

  constructor(listingEntity?: ListingEntity) {
    if (listingEntity) {
      this.title = listingEntity.title;
      this.address = listingEntity.address;
      this.year = listingEntity.year;
      this.publisher_type = listingEntity.publisher_type;
      this.description = listingEntity.description;
      this.price = listingEntity.price;
      this.price = listingEntity.price;
      this.rooms_count = listingEntity.rooms_count;
      this.total_area = listingEntity.total_area;
      this.living_area = listingEntity.living_area;
      this.kitchen_area = listingEntity.kitchen_area;
      this.floor = listingEntity.floor;
      this.floor_in_house = listingEntity.floor_in_house;
      this.phone_number = listingEntity.phone_number;
      this.publication_date = listingEntity.publication_date;
    }
  }
}
