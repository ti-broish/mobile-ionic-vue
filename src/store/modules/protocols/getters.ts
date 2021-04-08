import { GetterTree } from "vuex";
import { ProtocolData, ProtocolState, defaultProtocolData } from "./types";
import { RootState } from "@/store";
import { LocalStorageKeys } from "@/store/local-storage-keys";

export const getters: GetterTree<ProtocolState, RootState> = {
  getProtocolData(state): ProtocolData {
    const cachedProtocol = localStorage.getItem(LocalStorageKeys.protocol);

    if (cachedProtocol) {
      return JSON.parse(cachedProtocol);
    } else if (state.data) {
      return state.data;
    } else {
      return defaultProtocolData;
    }
  }
}
