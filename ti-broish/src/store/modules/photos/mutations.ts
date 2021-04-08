import { MutationTree } from "vuex";
import { Photo, UploadPhoto, PhotosState } from "../photos/types";

export const mutations: MutationTree<PhotosState> = {

  setPhotos(state, playload: Array<Photo>) {
    state.photos = playload;
  },

  deletePhoto(state, photo: Photo) {
    const index = state.photos.indexOf(photo, 0);

    if (index != -1) {
      state.photos.splice(index, 1);
    }
  },

  setUploadPhotos(state, payload: Array<UploadPhoto>) {
    state.uploadPhotos = payload
  },

  resetPhotos(state) {
    state.photos.length = 0;
  },

  resetUploadPhotos(state) {
    state.uploadPhotos.length = 0;
  },

  resetState(state) {
    state.photos.length = 0;
    state.uploadPhotos.length = 0;
  }
}