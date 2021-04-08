import { Module } from 'vuex';
import { RootState } from '@/store';
import { Section } from './types';

const namespaced = true;

export const sections: Module<Section, RootState> = {
  namespaced,
};