import {ListingEntity} from "../entity/listing.entity";

export interface StorageInterface {

  save(listing): Promise<any>;

}
