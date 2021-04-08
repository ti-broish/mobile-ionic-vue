import { Module } from 'vuex';
import { RootState } from '@/store';
import { ProfileState } from './types';
import { getters } from './getters';
import { mutations } from './mutations';
import { actions } from './actions';

export const state: ProfileState = {
  user: undefined
};

const namespaced = true;

export const user: Module<ProfileState, RootState> = {
  namespaced,
  state,
  getters,
  mutations,
  actions
};
