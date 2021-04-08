export interface CityRegion {
  code: string;
  name: string;
}

export interface Town {
  id: number;
  code: number;
  name: string;
  cityRegions?: Array<CityRegion>;
}

export const defaultCityRegion: CityRegion = {
  code: "", 
  name: ""
}

export const defaultTown: Town = {
  id: -1,
  code: -1, 
  name: "",
  cityRegions: []
}