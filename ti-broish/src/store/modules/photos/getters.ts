import { GetterTree } from "vuex";
import { Photo, UploadPhoto, PhotosState } from "./types";
import { RootState } from "@/store";

export const getters: GetterTree<PhotosState, RootState> = {

  getPhotos(state): Array<Photo> {
    return state.photos;
  },

  getUploadPhotos(state): Array<UploadPhoto> {
    return state.uploadPhotos;
  }
}