export class ListingMetadata {
  floor: number;
  floor_in_house: number;
  rooms_count: number;
  total_area: number;
  kitchen_area: number;
  living_area: number;
  type: string;

  constructor(data?: ListingMetadata) {
    // @ts-ignore
    return (async () => {
      if (data) {
        this.floor = data.floor;
        this.floor_in_house = data.floor_in_house;
        this.rooms_count = data.rooms_count;
        this.total_area = data.total_area;
        this.kitchen_area = data.kitchen_area;
        this.living_area = data.living_area;
      }
    })();
  }

}
