<template>
  <ion-page>
    <ion-content>
      <navigation-toolbar-component
        @navigation-back-button-pressed="goBack()"
      ></navigation-toolbar-component>

      <div class="pInfoContainer">
        <p>
          <span>Статус: </span
          ><b v-bind:style="{ color: protocol.statusColor }">{{
            protocol.statusLocalized
          }}</b>
        </p>
        <p>
          <span>Протокол: </span><b>{{ protocol.id }}</b>
        </p>
        <p>
          <span>Номер на секция: </span><b>{{ protocol.section?.id }}</b>
        </p>
        <p v-if="protocol.section?.place.length > 0">
          <span>Локация: </span><b>{{ protocol.section?.place }}</b>
        </p>
      </div>

      <div class="thumbnailContainer">
        <ion-thumbnail
          @click="showPhoto(photo.url)"
          class="ionThumbnail"
          v-for="photo in protocol.pictures"
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
import { ProtocolResponse } from "@/store/modules/protocols/types";
import { LocalStorageKeys } from "@/store/local-storage-keys";
import { AlertType, useStore } from "@/store";
import { ApiClient } from "@/services/api.client";
import { Loader } from "@/services/loader";
import { ErrorCommon } from "@/services/error-handler";

import NavigationToolbarComponent from "@/components/NavigationToolbarComponent.vue";
import ImagePreview from "@/components/ImagePreviewComponent.vue";

export default defineComponent({
  name: "ProtocolDetailsPage",
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
      protocol: {} as ProtocolResponse,
    };
  },
  mounted() {
    this.loadProtocol();
    this.loadAPNProtocol();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    loadProtocol() {
      const key = LocalStorageKeys.protocol;
      const cachedProtocol = localStorage.getItem(key);

      if (cachedProtocol) {
        this.protocol = JSON.parse(cachedProtocol);
        localStorage.removeItem(key);
      }
    },
    loadAPNProtocol() {
      const key = LocalStorageKeys.apnProtocol;
      const cachedProtocolId = localStorage.getItem(key);

      if (cachedProtocolId) {
        const user = this.store.getters["user/currentUser"];

        this.loader.showLoading();
        this.client
          .getProtocol(user, cachedProtocolId)
          .then((response) => {
            this.protocol = response;
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
  font-size: 14px;
  padding: 8px;
  border: 1px solid #c3c3c3;
}

.pInfoContainer span {
  font-size: 14px;
  color: #666;
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
