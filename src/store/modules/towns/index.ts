import { Module } from 'vuex';
import { RootState } from '@/store';
import { Town } from './types';

const namespaced = true;

export const towns: Module<Town, RootState> = {
  namespaced,
};