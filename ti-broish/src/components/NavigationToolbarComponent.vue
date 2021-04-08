<template>
  <ion-header>
    <ion-toolbar class="navigationToolbar">
      <ion-buttons v-if="!showCloseButton" slot="start">
        <ion-button @click="goBack()">
          <ion-icon src="/assets/arrow-back.svg"></ion-icon>
          Назад
        </ion-button>
      </ion-buttons>
      <ion-buttons v-if="showCloseButton" slot="end">
        <ion-button @click="goBack()">
          <ion-icon src="/assets/close.svg"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>
<script lang="ts">
import { IonHeader, IonToolbar } from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "NavigationToolbarComponent",
  components: {
    IonHeader,
    IonToolbar,
  },
  props: {
    pShowCloseButton: Boolean,
  },
  emits: {
    "navigation-back-button-pressed": null,
  },
  data() {
    return {
      showCloseButton: this.pShowCloseButton ?? false,
    };
  },
  methods: {
    goBack() {
      this.$emit("navigation-back-button-pressed", "");
    },
  },
});
</script>

<style scoped>
.navigationToolbar {
  --background: var(--tib-color-primary);
  --color: #ffffff;
}
</style>
