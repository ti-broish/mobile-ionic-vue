export const enum OrganizationType {
  party = "party", 
  commission = "commission", 
  watchers = "watchers"
}

export interface Organization {
  id: number;
  name: string;
  type: string;
}

export const defaultOrganization: Organization = {
  id: -1, 
  name: "", 
  type: "",
}