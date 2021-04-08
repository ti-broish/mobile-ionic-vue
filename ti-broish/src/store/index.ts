import { InjectionKey } from "vue";
import { createStore, useStore as baseUseStore, Store } from "vuex";
import { user } from "./modules/user";
import { organizations } from "./modules/organizations";
import { countries } from "./modules/countries";
import { electionRegions } from "./modules/election-regions";
import { towns } from "./modules/towns";
import { sections } from "./modules/sections";
import { parties } from "./modules/parties";
import { protocols } from "./modules/protocols";
import { photos } from "./modules/photos";
import { violations } from "./modules/violations";
import { toastController } from '@ionic/vue'

export enum AlertType {
  INFO = 'INFO',
  ERROR = 'ERROR'
}

// define your typings for the store state
export interface RootState {
  version: string;
  alert: {
    show: boolean;
    type: string;
    message: string;
  };
}

// define injection key
export const key: InjectionKey<Store<RootState>> = Symbol()

export const store = createStore<RootState>({
  state: {
    version: '1.0.0',
    alert: {
      show: false,
      type: AlertType.INFO,
      message: '',
    }
  },
  modules: {
    user,
    organizations,
    countries,
    electionRegions,
    towns,
    sections,
    parties,
    protocols,
    photos,
    violations
  },
  getters: {
    alert: state => state.alert,
  },
  actions: {
    async showAlert({ commit }, payload) {
      // set alert in store
      commit('setAlert', payload)

      // show alert in UI
      toastController.create({
        header: payload.type === AlertType.ERROR ? 'Грешка:' : '',
        message: payload.message,
        duration: 5000,
        position: payload.position ?? 'bottom', 
        color: 'dark'
      }).then(toast => {
        toast.onDidDismiss().then(() => commit('clearAlert'))
        toast.present();
      })
    }
  },
  mutations: {
    setAlert(state, {type, message}) {
      state.alert.message = message
      state.alert.type = type
      state.alert.show = true
    },
    clearAlert(state) {
      state.alert.message = ''
      state.alert.type = AlertType.INFO
      state.alert.show = false
    }
  }
})

// define your own `useStore` composition function
export function useStore () {
  return baseUseStore(key)
}

export function resetStore() {
  store.commit("user/resetState");
  store.commit("protocols/resetState");
  store.commit("photos/resetState");
  store.commit("violations/resetState");
}
