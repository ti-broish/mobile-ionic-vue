<template>
  <div class="photosContainer">
    <!-- Buttons -->
    <div>
      <div class="photoButtonsLabelContainer">
        <ion-label>Изпрати снимка <span v-show="pRequired" class="required">*</span></ion-label>
      </div>
      <div class="photoButtonsContainer">
        <ion-button class="actionButton" @click="showPhotoGallery()">
          <img class="imgGallery imgTintColor"/>&nbsp;КАЧИ СНИМКА
        </ion-button>
        <ion-button class="actionButton" @click="takePhoto()">
          <img class="imgCamera imgTintColor"/>&nbsp;СНИМАЙ
        </ion-button>
      </div>
    </div>
    <!-- Selected photos -->
    <div v-show="showSelectedPhotos">
      <ion-list>
        <ion-item v-for="photo in selectedPhotos" :key="photo.filename">
          <ion-thumbnail slot="start">
            <ion-img :src="photo.webviewPath"></ion-img>
          </ion-thumbnail>
          <ion-label>{{ photo.filename }}</ion-label>
          <ion-button class="ionCloseButton" @click="deleteSelectedPhoto(photo)" slot="end" color="danger">
              <ion-icon icon="close"></ion-icon>
            </ion-button>
        </ion-item>
      </ion-list>
    </div>
  </div>
</template>

<script lang="ts">
import { IonLabel, IonButton, IonList, IonItem, IonThumbnail, IonImg } from "@ionic/vue";
import { defineComponent } from "vue";
import { Photo } from "@/store/modules/photos/types";

export default defineComponent({
  name: "SelectedPhotosComponent",
  props: {
    pSelectedPhotos: Array,
    pRequired: Boolean,
  }, 
  emits: {
    "show-photo-gallery": null, 
    "take-photo": null, 
    "delete-selected-photo": null
  }, 
  components: {
    IonLabel,
    IonButton,
    IonList,
    IonItem,
    IonThumbnail,
    IonImg,
  },
  data() {
    return {
      showSelectedPhotos: false,
      selectedPhotos: this.pSelectedPhotos ?? ([] as Array<Photo>),
    };
  },
  watch: {
    pSelectedPhotos: "reloadSelectedPhotos",
  }, 
  methods: {
    showPhotoGallery() {
      this.$emit("show-photo-gallery");
    }, 
    takePhoto() {
      this.$emit("take-photo");
    }, 
    deleteSelectedPhoto(photo: Photo) {
      this.$emit("delete-selected-photo", photo);
    },
    reloadSelectedPhotos() {
      if (this.pSelectedPhotos) {
        this.selectedPhotos = this.pSelectedPhotos;
      }

      this.showSelectedPhotos = this.selectedPhotos.length > 0;
    }
  },
});
</script>

<style scoped>
.photosContainer {
  margin: auto;
}

.photoButtonsLabelContainer {
  margin: auto;
  padding: 8px;
}

.photoButtonsContainer {
  margin: 8px auto;
  width: 100%;
  max-width: 1024px;
  text-align: center;
}
</style>
