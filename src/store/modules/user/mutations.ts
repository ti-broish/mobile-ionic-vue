import { MutationTree } from 'vuex';
import { Organization } from '../organizations/types';
import { ProfileState, User, UserDetails } from './types';
import { LocalStorageKeys } from '../../local-storage-keys';

export const mutations: MutationTree<ProfileState> = {
  setUser(state, payload: User) {
    if (payload && payload.firebaseJwt) {
      state.user = payload;
      // cache user in local storage
      localStorage.setItem(LocalStorageKeys.user, JSON.stringify(payload));
    }
  },

  setOrganization(state, payload: Organization) {
    if (state.user) {
      state.user.userDetails.organization = payload;
    }
  },

  setUserDetails(state, payload: UserDetails) {
    if (state.user) {
      state.user.userDetails.firstName = payload.firstName;
      state.user.userDetails.lastName = payload.lastName;
      state.user.userDetails.email = payload.email;
      state.user.userDetails.phone = payload.phone;
      state.user.userDetails.pin = payload.pin;
      state.user.userDetails.organization = payload.organization;
      state.user.userDetails.hasAgreedToKeepData = payload.hasAgreedToKeepData;

      localStorage.setItem(LocalStorageKeys.loginEmail, payload.email);
    }
  },

  setFirebaseJwt(state, firebaseJwt: string) {
    if (state.user) {
      state.user.firebaseJwt = firebaseJwt;
    }
  }, 

  resetState(state) {
    state.user = undefined;
    localStorage.removeItem(LocalStorageKeys.user);
  }
};
