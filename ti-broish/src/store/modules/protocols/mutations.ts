import { MutationTree } from "vuex";
import { ProtocolData, ProtocolState } from "../protocols/types";
import { LocalStorageKeys } from "../../local-storage-keys";

export const mutations: MutationTree<ProtocolState> = {
  setProtocolData(state, payload: ProtocolData) {
    if (state.data) {
      state.data.data.country = payload.data.country;
      state.data.data.electionRegion = payload.data.electionRegion;
      state.data.data.municipality = payload.data.municipality;
      state.data.data.town = payload.data.town;
      state.data.data.cityRegion = payload.data.cityRegion;
      state.data.data.section = payload.data.section;
    } else {
      state.data = payload
    }
    localStorage.setItem(LocalStorageKeys.protocol, JSON.stringify(state.data))
  },

  resetState(state) {
    state.data = undefined;
    localStorage.removeItem(LocalStorageKeys.protocol)
  }
}
