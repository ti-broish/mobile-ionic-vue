import { Module } from "vuex";
import { RootState } from "@/store";
import { ViolationState } from "./types";
import { getters } from "./getters";
import { mutations } from "./mutations";

export const state: ViolationState = {
  data: undefined
}

const namespaced = true;

export const violations: Module<ViolationState, RootState> = {
  namespaced,
  state,
  getters,
  mutations
};