import { MutationTree } from "vuex";
import { ViolationData, ViolationState } from "../violations/types";
import { LocalStorageKeys } from "../../local-storage-keys";

export const mutations: MutationTree<ViolationState> = {

  setViolationData(state, payload: ViolationData) {
    if (state.data) {
      state.data.data.country = payload.data.country;
      state.data.data.electionRegion = payload.data.electionRegion;
      state.data.data.municipality = payload.data.municipality;
      state.data.data.town = payload.data.town;
      state.data.data.cityRegion = payload.data.cityRegion;
      state.data.data.section = payload.data.section;
      state.data.description = payload.description;
    } else {
      state.data = payload
    }
  },

  resetState(state) {
    state.data = undefined;
    localStorage.removeItem(LocalStorageKeys.violation);
  }
}