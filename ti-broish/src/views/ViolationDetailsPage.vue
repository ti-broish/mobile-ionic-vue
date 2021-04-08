<template>
  <ion-page>
    <ion-content>
      <navigation-toolbar-component
        @navigation-back-button-pressed="goBack()"
      ></navigation-toolbar-component>

      <div class="pInfoContainer">
        <p>
          <span>Статус: </span
          ><b v-bind:style="{ color: violation.statusColor }">{{
            violation.statusLocalized
          }}</b>
        </p>
        <p>
          <span>Сигнал: </span><b>{{ violation.id }}</b>
        </p>
        <p v-if="violation.section?.id">
          <span>Номер на секция: </span><b>{{ violation.section?.id }}</b>
        </p>
        <p v-if="violation.section?.place.length > 0">
          <span>Локация: </span><b>{{ violation.section?.place }}</b>
        </p>
        <p v-if="violation.description?.length > 0">
          <span>Описание: </span><b>{{ violation.description }}</b>
        </p>
      </div>

      <div class="thumbnailContainer">
        <ion-thumbnail
          @click="showPhoto(photo.url)"
          class="ionThumbnail"
          v-for="photo in violation.pictures"
          :key="photo.id"
          ><ion-img :src="photo.url"></ion-img
        ></ion-thumbnail>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonPage, IonContent, modalController } from "@ionic/vue";
import { defineComponent } from "vue";
import { ViolationResponse } from "@/store/modules/violations/types";
import { LocalStorageKeys } from "@/store/local-storage-keys";
import { AlertType, useStore } from "@/store";
import { ApiClient } from "@/services/api.client";
import { Loader } from "@/services/loader";
import { ErrorCommon } from "@/services/error-handler";

import NavigationToolbarComponent from "@/components/NavigationToolbarComponent.vue";
import ImagePreview from "@/components/ImagePreviewComponent.vue";

export default defineComponent({
  name: "ViolationDetailsPage",
  components: {
    IonPage,
    IonContent,
    NavigationToolbarComponent,
  },
  setup() {
    const store = useStore();
    const client = new ApiClient();
    const loader = new Loader();

    return { store, client, loader };
  },
  data() {
    return {
      violation: {} as ViolationResponse,
    };
  },
  mounted() {
    this.loadViolation();
    this.loadAPNViolation();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    loadViolation() {
      const key = LocalStorageKeys.violation;
      const cachedViolation = localStorage.getItem(key);

      if (cachedViolation) {
        this.violation = JSON.parse(cachedViolation);
        localStorage.removeItem(key);
      }
    },
    loadAPNViolation() {
      const key = LocalStorageKeys.apnViolation;
      const cachedViolationId = localStorage.getItem(key);

      if (cachedViolationId) {
        const user = this.store.getters["user/currentUser"];

        this.loader.showLoading();
        this.client
          .getViolation(user, cachedViolationId)
          .then((response) => {
            this.violation = response;
            localStorage.removeItem(key);
            this.loader.hideLoading();
          })
          .catch(() => {
            localStorage.removeItem(key);
            this.loader.hideLoading();

            this.store.dispatch("showAlert", {
              message: ErrorCommon.defaultError,
              type: AlertType.ERROR,
            });
          });
      }
    },
    async showPhoto(imageUrl: string) {
      const modal = await modalController.create({
        component: ImagePreview,
        componentProps: {
          pImageUrl: imageUrl,
          pModalController: modalController,
        },
      });

      return modal.present();
    },
  },
});
</script>

<style scoped>
.pInfoContainer {
  margin-left: 16px;
  margin-right: 16px;
}

.pInfoContainer p {
  padding: 8px;
  border: 1px solid #c3c3c3;
  font-size: 14px;
}

.pInfoContainer span {
  color: #666;
  font-size: 14px;
}

.thumbnailContainer {
  margin-left: 16px;
  margin-right: 16px;
  text-align: center !important;
}

.ionThumbnail {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  margin-bottom: 16px;
  border: 1px solid #c3c3c3;
}
</style>
