import "reflect-metadata";

import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

import {Listing} from "./listing";

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

  @Column("text")
  publication_date: string;

  constructor(listingEntity?: Listing) {
    // @ts-ignore
    return (async () => {
      console.log('const listingEntity');
      this.title = listingEntity.title;
      this.address = listingEntity.address;
      this.year = listingEntity.year;
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
      return this; // when done
    })();
  }
}
