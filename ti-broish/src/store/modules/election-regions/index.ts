import { Module } from 'vuex';
import { RootState } from '@/store';
import { ElectionRegion } from './types';

const namespaced = true;

export const electionRegions: Module<ElectionRegion, RootState> = {
  namespaced,
};