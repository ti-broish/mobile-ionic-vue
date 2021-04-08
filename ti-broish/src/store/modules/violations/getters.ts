import { GetterTree } from "vuex";
import { ViolationData, ViolationState, defaultViolationData } from "./types";
import { RootState } from "@/store";

export const getters: GetterTree<ViolationState, RootState> = {

  getViolationData(state): ViolationData {
    if (state.data) {
      return state.data;
    }

    return defaultViolationData;
  }
}