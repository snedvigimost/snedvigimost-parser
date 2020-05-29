import {ListingEntity} from "../entity/listing.entity";

export interface StorageInterface {

  save(listing: ListingEntity): Promise<ListingEntity>;

}
