<template>
  <ion-page>
    <ion-content>
      <menu-component></menu-component>
      <div class="titleContainer">
        <ion-label class="titleLabel">МОИТЕ ПРОТОКОЛИ</ion-label>
      </div>

      <ion-list>
        <ion-item
          v-for="(protocol, index) in protocols"
          :key="protocol.id"
          @click="showProtocol(index)"
        >
          <ion-label>
            <p v-if="protocol.section?.place.length > 0">
              {{ index + 1 }}. Секция: <b>{{ protocol.section.id }}</b
              ><br />
              {{ protocol.section.place }}<br />
              <b v-bind:style="{ color: protocol.statusColor }">{{
                protocol.statusLocalized
              }}</b>
            </p>
            <p v-else-if="protocol.section.id.length > 0">
              {{ index + 1 }}. Секция: <b>{{ protocol.section.id }}</b
              ><br />
              <b v-bind:style="{ color: protocol.statusColor }">{{
                protocol.statusLocalized
              }}</b>
            </p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonPage, IonContent, IonList, IonItem, IonLabel } from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { AlertType, useStore } from "@/store";
import { ApiClient } from "@/services/api.client";
import { Loader } from "@/services/loader";
import { ProtocolResponse } from "@/store/modules/protocols/types";
import { LocalStorageKeys } from "@/store/local-storage-keys";
import { ErrorCommon } from "@/services/error-handler";

import MenuComponent from "@/components/MenuComponent.vue";

export default defineComponent({
  name: "ProtocolsPage",
  components: {
    IonPage,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    MenuComponent,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const client = new ApiClient();
    const loader = new Loader();

    return { store, router, client, loader };
  },
  data() {
    return {
      protocols: [] as Array<ProtocolResponse>,
    };
  },
  mounted() {
    this.getProtocols();
  },
  methods: {
    currentUser() {
      return this.store.getters["user/currentUser"];
    },
    getProtocols() {
      this.loader.showLoading();
      this.client
        .getProtocols(this.currentUser())
        .then((response) => {
          this.protocols = response;
          this.loader.hideLoading();
        })
        .catch(() => {
          this.loader.hideLoading();
          
          this.store.dispatch("showAlert", {
            message: ErrorCommon.defaultError,
            type: AlertType.ERROR,
          });
        });
    },
    showProtocol(index: number) {
      localStorage.setItem(
        LocalStorageKeys.protocol,
        JSON.stringify(this.protocols[index])
      );

      this.$router.push("/home/protocols/protocol");
    },
  },
  ionViewWillEnter() {
    this.loader.hideLoading();
  },
});
</script>

<style scoped>
.ionHeader {
  padding-top: 10px;
  height: 44px;
  text-align: center;
}
</style>
