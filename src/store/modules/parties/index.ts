import { Module } from 'vuex';
import { RootState } from '@/store';
import { Party } from './types';

const namespaced = true;

export const parties: Module<Party, RootState> = {
  namespaced,
};