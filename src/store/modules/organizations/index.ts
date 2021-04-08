import { Module } from 'vuex';
import { RootState } from '@/store';
import { Organization } from './types';

const namespaced = true;

export const organizations: Module<Organization, RootState> = {
  namespaced,
};