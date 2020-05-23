import {ListingMetadata} from "./listing-metadata";

export class Listing extends ListingMetadata {
  title: string;
  price: number;
  year: number;
  address: string;
  description: string;
  publication_date: string;
  phone_number: string;

  constructor(metadata?: ListingMetadata) {
    super(metadata);
    // @ts-ignore
    return (async () => {
      console.log('constructor');
      return this; // when done
    })();
  }
}
