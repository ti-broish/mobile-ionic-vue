export interface Country {
  code: string;
  name: string;
  isAbroad: boolean;
}

export interface CountryPhoneCode {
  code: string;
  name: string;
}

export const defaultCountry: Country = {
  code: "", name: "", isAbroad: false
}