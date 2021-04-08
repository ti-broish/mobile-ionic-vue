<template>
  <ion-page>
    <ion-content>
      <menu-component></menu-component>

      <div id="container">
        <ion-item lines="none">
          <ion-button class="button actionButton" @click="sendProtocol()"
            >Изпрати протокол</ion-button
          >
        </ion-item>
        <ion-item lines="none">
          <ion-button class="button actionButton" @click="sendSignal()"
            >Изпрати сигнал</ion-button
          >
        </ion-item>
        <ion-item lines="none">
          <ion-button class="button actionButton" @click="showTerms()"
            >Права и задължения</ion-button
          >
        </ion-item>
        <ion-item lines="none">
          <ion-button class="button actionButton" @click="showStartStream()"
            >Ти броиш <span id="ti-broish-live">LIVE</span></ion-button
          >
        </ion-item>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonButton, IonContent, IonPage } from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import { ApiClient } from "@/services/api.client";

import MenuComponent from "@/components/MenuComponent.vue";
import { LocalStorageKeys } from "@/store/local-storage-keys";

export default defineComponent({
  name: "HomePage",
  components: {
    IonButton,
    IonContent,
    IonPage,
    MenuComponent,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const client = new ApiClient();

    return { store, router, client };
  },
  async mounted() {
    // go back if no active protocol
    if (!this.store.getters["user/isLoggedIn"]) {
      await this.router.replace("/login");
    }
  },
  methods: {
    sendProtocol() {
      this.$router.replace({ path: "/home/send-protocol" });
    },
    sendSignal() {
      this.$router.replace({ path: "/home/send-violation" });
    },
    showTerms() {
      this.$router.replace({ path: "/home/terms" });
    },
    showStartStream() {
      this.$router.replace({ path: "/home/start-stream" });
    },
    sendPushNotificationsTokenIfNeeded() {
      const token = localStorage.getItem(LocalStorageKeys.apnToken);
      if (token) {
        const user = this.store.getters["user/currentUser"];
        this.client
          .sendAPNToken(user, token)
          .then(() => {
            localStorage.removeItem(LocalStorageKeys.apnToken);
          })
          .catch(() => {
            // Handle sendAPNToken error
          });
      }
    },
  },
  ionViewWillEnter() {
    this.sendPushNotificationsTokenIfNeeded();
  },
});
</script>

<style scoped>
.button {
  margin: 16px auto;
  min-width: 70%;
  height: 60px;
}

#ti-broish-live {
  margin-left: 8px;
  padding: 8px;
  color: white;
  background-color: red;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}
</style>
