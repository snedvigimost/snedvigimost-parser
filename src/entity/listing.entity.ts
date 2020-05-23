import "reflect-metadata";
import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

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
}
