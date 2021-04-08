import { GetterTree } from 'vuex';
import { defaultUser, ProfileState, User } from './types';
import { RootState } from '@/store';
import { defaultOrganization, Organization } from '@/store/modules/organizations/types';

export const getters: GetterTree<ProfileState, RootState> = {

  isLoggedIn(state): boolean {
    return typeof state.user !== 'undefined' && state.user.firebaseUid.length > 0 && state.user.firebaseJwt.length > 0
  },

  firebaseJwt(state): string {
    return state.user?.firebaseJwt ?? "";
  },

  firstName(state): string {
    return state.user?.userDetails.firstName ?? "";
  },

  lastName(state): string {
    return state.user?.userDetails.lastName ?? "";
  },

  email(state): string {
    return state.user?.userDetails.email ?? "";
  },

  phone(state): string {
    return state.user?.userDetails.phone ?? "";
  },

  organization(state): Organization {
    return state.user?.userDetails.organization ?? defaultOrganization;
  },

  hasAgreedToKeepData(state): boolean {
    return state.user?.userDetails.hasAgreedToKeepData ?? false;
  }, 

  currentUser(state): User {
    if (state.user) {
      return state.user;
    }

    return defaultUser;
  }
};
