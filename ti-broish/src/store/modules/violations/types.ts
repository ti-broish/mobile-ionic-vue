/* Send violation */
import { defaultCountry } from "../countries/types";
import { defaultElectionRegion, defaultMunicipality } from "../election-regions/types";
import { defaultTown, defaultCityRegion } from "../towns/types";
import { defaultSection, Section } from "../sections/types";
import { UploadPhoto } from "../photos/types";
import { RequestData } from "../request-data";

export interface ViolationData {
  description: string;
  data: RequestData;
}

export interface SendViolationResponse {
  id: number;
  section: Section;
  pictures: Array<UploadPhoto>;
  description: string;
  status: string;
}

export interface ViolationState {
  data?: ViolationData;
}

export interface ViolationResponsePhoto {
  id: string;
  path: string;
  sortPosition: number;
  url: string;
}

export interface ViolationResponseSection {
  id: string;
  code: string;
  place: string;
}

export interface ViolationResponse {
  id: string;
  description: string;
  pictures: Array<ViolationResponsePhoto>;
  sections: Array<ViolationResponseSection>;
  status: string;
  statusLocalized: string;
  statusColor: string;
}

export const defaultViolationData: ViolationData = {
  description: "",
  data: {
    country: defaultCountry,
    electionRegion: defaultElectionRegion,
    municipality: defaultMunicipality,
    town: defaultTown,
    cityRegion: defaultCityRegion,
    section: defaultSection,
  },
}