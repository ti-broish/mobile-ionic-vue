<template>
  <ion-header>
    <ion-toolbar class="menuToolbar">
      <ion-buttons>
        <ion-menu-button
          class="menuButton"
          menu="mainMenu"
          auto-hide="false"
        ></ion-menu-button>
        <ion-title class="logoCenter">
          <img src="/assets/menu-logo.png" width="160" height="40"/>
        </ion-title>
        <!--
        <ion-button
          class="doneButton"
          slot="end" 
          v-show="doneButtonIsVisible"
          @click="didPressDoneButton()"
          >Готово</ion-button
        >
        -->
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script lang="ts">
import { IonMenuButton, IonButtons, IonToolbar, IonHeader } from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "MenuComponent",
  props: {
    doneButtonIsVisible: Boolean,
  },
  emits: {
    "did-press-navigation-done-button": null,
  },
  components: {
    IonMenuButton,
    IonButtons,
    IonToolbar,
    IonHeader,
  },
  methods: {
    didPressDoneButton() {
      this.$emit("did-press-navigation-done-button");
    }
  },
});
</script>

<style scoped>
.menuToolbar {
  --background: var(--tib-color-primary);
}

.menuButton,
.menuTitle,
.doneButton {
  --color: white;
}

.logoCenter {
  text-align: center !important;
  padding-top: 10px;
}
</style>
