import { Module } from 'vuex';
import { RootState } from '@/store';
import { Photo, UploadPhoto, PhotosState } from './types';
import { getters } from './getters';
import { mutations } from './mutations';

export const state: PhotosState = {
  photos: Array<Photo>(), 
  uploadPhotos: Array<UploadPhoto>()
}

const namespaced = true;

export const photos: Module<PhotosState, RootState> = {
  namespaced,
  state, 
  getters, 
  mutations
};