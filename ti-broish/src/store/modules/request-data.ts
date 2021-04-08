import { Country } from "./countries/types";
import { ElectionRegion, Municipality } from "./election-regions/types";
import { Town, CityRegion } from "./towns/types";
import { Section } from "./sections/types";
import { UploadPhoto } from "./photos/types";

export interface RequestData {
  country?: Country;
  electionRegion?: ElectionRegion;
  municipality?: Municipality;
  town?: Town;
  cityRegion?: CityRegion;
  section?: Section;
  pictures?: Array<UploadPhoto>;
}