<template>
  <ion-page>
    <ion-content>
      <menu-component></menu-component>
      <div class="titleContainer">
        <ion-label class="titleLabel">МОИТЕ СИГНАЛИ</ion-label>
      </div>

      <ion-list>
        <ion-item
          v-for="(violation, index) in violations"
          :key="violation.id"
          @click="showViolation(index)"
        >
          <ion-label>
            <p v-if="violation.section?.place.length > 0">
              {{ index + 1 }}: Секция: <b>{{ violation.section.id }}</b
              ><br />
              Локация: <b>{{ violation.section.place }}</b
              ><br />
              Описание: <b>{{ violation.description }}</b
              ><br />
              <b v-bind:style="{ color: violation.statusColor }">{{
                violation.statusLocalized
              }}</b>
            </p>
            <p v-else-if="violation.section?.place.length === 0">
              {{ index + 1 }}. Секция: <b>{{ violation.section.id }}</b>
              <br />
              Описание: <b>{{ violation.description }}</b
              ><br />
              <b v-bind:style="{ color: violation.statusColor }">{{
                violation.statusLocalized
              }}</b>
            </p>
            <p v-else-if="violation.section === null">
              {{ index + 1 }}: Описание: <b>{{ violation.description }}</b>
              <br />
              <b v-bind:style="{ color: violation.statusColor }">{{
                violation.statusLocalized
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
import { /*AlertType,*/ useStore } from "@/store";
import { ApiClient } from "@/services/api.client";
import { Loader } from "@/services/loader";
import { ViolationResponse } from "@/store/modules/violations/types";
import { LocalStorageKeys } from "@/store/local-storage-keys";

import MenuComponent from "@/components/MenuComponent.vue";

export default defineComponent({
  name: "ViolationsPage",
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
      violations: [] as Array<ViolationResponse>,
    };
  },
  mounted() {
    this.getViolations();
  },
  methods: {
    currentUser() {
      return this.store.getters["user/currentUser"];
    },
    getViolations() {
      this.loader.showLoading();
      this.client
        .getViolations(this.currentUser())
        .then((response) => {
          this.violations = response;
          this.loader.hideLoading();
        })
        .catch(() => {
          this.loader.hideLoading();
        });
    },
    showViolation(index: number) {
      localStorage.setItem(
        LocalStorageKeys.violation,
        JSON.stringify(this.violations[index])
      );

      this.$router.push("/home/violations/violation");
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
