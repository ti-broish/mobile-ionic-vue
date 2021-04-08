import { Module } from 'vuex';
import { RootState } from '@/store';
import { Country } from './types';

const namespaced = true;

export const countries: Module<Country, RootState> = {
  namespaced,
};