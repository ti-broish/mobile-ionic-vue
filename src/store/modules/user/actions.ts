import { UserActions } from '@/store/modules/user/actions-types'
import { User, UserDetails } from '@/store/modules/user/types'
import { ApiClient } from '@/services/api.client'
import firebase from 'firebase'
import { resetStore } from '@/store'
import { LocalStorageKeys } from '@/store/local-storage-keys';

const client = new ApiClient()

export const actions = {
  [UserActions.INIT_USER]({commit, getters}: any) {
    // try to init user from local storage
    const localUser = localStorage.getItem(LocalStorageKeys.user);
    if (localUser) {
      const user: User = JSON.parse(localUser);
      commit('setUser', user);

      // token found, get user data from api
      if (getters.currentUser.firebaseJwt) {
        client.getUserDetails(getters.currentUser.firebaseJwt)
          .then((userData: UserDetails) => commit('setUserDetails', userData))
          .catch(err => console.error(err));
      }
    }
  },

  [UserActions.LOGOUT]() {
    // sign out from firebase
    firebase
      .auth()
      .signOut()
      .then(() => {
        resetStore();
      })
      .catch((error) => {
        console.error(error.message);
      });

    // clear locally cached user
    localStorage.removeItem(LocalStorageKeys.user)
  }
}
