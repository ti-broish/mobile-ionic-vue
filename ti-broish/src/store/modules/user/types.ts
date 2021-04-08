import { Organization } from "@/store/modules/organizations/types";

export interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pin: string;
  organization?: Organization;
  hasAgreedToKeepData: boolean;
}

export interface User {
  userDetails: UserDetails;
  firebaseUid: string;
  firebaseJwt: string;
}

export interface ProfileState {
  user?: User;
}

export interface DeleteUserResponse {
  status: number;
}

export const defaultUser: User = {
  userDetails: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    pin: "",
    organization: undefined,
    hasAgreedToKeepData: false
  },
  firebaseUid: "",
  firebaseJwt: "",
}