/* Send protocol */
import { defaultCountry } from "../countries/types";
import { defaultElectionRegion, defaultMunicipality } from "../election-regions/types";
import { defaultTown, defaultCityRegion } from "../towns/types";
import { defaultSection, Section } from "../sections/types";
import { UploadPhoto } from "../photos/types";
import { RequestData } from "../request-data";

export interface ProtocolData {
  id?: string | number;
  data: RequestData;
}

export interface SendProtocolResponse {
  id: number;
  section: Section;
  pictures: Array<UploadPhoto>;
  status: string;
}

export interface ProtocolState {
  data?: ProtocolData;
}

export interface ProtocolResponsePhoto {
  id: string;
  path: string;
  sortPosition: number;
  createdAt: string;
  url: string;
}

export interface ProtocolResponseSection {
  id: string;
  code: string;
  isMachine: boolean;
  isMobile: boolean;
  isShip: boolean;
  place: string;
}

export interface ProtocolResponse {
  id: string;
  pictures: Array<ProtocolResponsePhoto>;
  section: ProtocolResponseSection;
  status: string;
  statusLocalized: string;
  statusColor: string;
}

export const defaultProtocolData: ProtocolData = {
  data: {
    country: defaultCountry,
    electionRegion: defaultElectionRegion,
    municipality: defaultMunicipality,
    town: defaultTown,
    cityRegion: defaultCityRegion,
    section: defaultSection
  }
}
