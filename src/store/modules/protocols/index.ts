import { Module } from "vuex";
import { RootState } from "@/store";
import { ProtocolState } from "./types";
import { getters } from "./getters";
import { mutations } from "./mutations";

export const state: ProtocolState = {
  data: undefined
}

const namespaced = true;

export const protocols: Module<ProtocolState, RootState> = {
  namespaced,
  state,
  getters,
  mutations
};