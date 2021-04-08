export interface Municipality {
  code: string;
  name: string;
}

export interface ElectionRegion {
  code: string;
  isAbroad: boolean;
  municipalities: Array<Municipality>;
  name: string;
}

export const defaultMunicipality: Municipality = {
  code: "", 
  name: ""
}

export const defaultElectionRegion: ElectionRegion = {
  code: "", 
  isAbroad: false, 
  municipalities: [], 
  name: ""
}