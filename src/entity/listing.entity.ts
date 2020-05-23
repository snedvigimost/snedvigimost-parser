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

}
