<template>
  <ion-page>
    <ion-content>
      <div style="height: 15%"></div>
      <div class="logoContainer">
        <ion-img src="/assets/logo.png"></ion-img>
      </div>
      <div class="contentContainer">
        <div class="titleContainer">
          <ion-label class="resetTitleLabel">Забравена парола</ion-label>
        </div>
        <div class="allFieldsContainer">
          <!-- Email -->
          <div class="fieldContainer">
            <ion-label class="fieldContainerLabel">Потребител:</ion-label>
            <ion-input
              class="resetIonInput"
              type="email"
              placeholder="Въведете имейл адрес"
              v-model="email"
              @keyup.enter="hideKeyboard($event.target)"
            >
            </ion-input>
          </div>
        </div>
      </div>
      <div class="buttonsContainer">
        <div>
          <!-- Login button -->
          <ion-button class="actionButton" @click="tryReset()">Изпрати</ion-button>
        </div>
        <div class="backButtonContainer">
          <!-- Back button -->
          <ion-button class="backButton" fill="clear" @click="() => router.go(-1)">
            Назад
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonButton, IonLabel, IonInput, IonContent, IonPage, IonImg } from "@ionic/vue";

import { defineComponent } from "vue";
import { AlertType, useStore } from "@/store";
import { useRouter } from "vue-router";
import { Loader } from "@/services/loader";
import { Plugins } from "@capacitor/core";
import { Validator } from "@/services/validator";
import { ErrorHandler, ErrorCommon } from "@/services/error-handler";

import firebase from "firebase";

export default defineComponent({
  name: "LoginPage",
  components: {
    IonButton,
    IonLabel,
    IonInput,
    IonContent,
    IonPage,
    IonImg,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const loader = new Loader();
    const validator = new Validator();
    const errorHandler = new ErrorHandler();

    return { store, router, loader, validator, errorHandler };
  },
  data() {
    return {
      email: "", //"test.fb.0@abv.bg",
    };
  },
  methods: {
    hideKeyboard(sender: HTMLIonInputElement) {
      sender?.blur();

      const { Keyboard } = Plugins;
      Keyboard.hide();
    },
    tryReset() {
      if (!this.validator.validateEmail(this.email)) {
        this.store.dispatch("showAlert", {
          type: AlertType.ERROR,
          message: ErrorCommon.invalidEmail,
        });

        return;
      }

      firebase
        .auth()
        .sendPasswordResetEmail(this.email)
        .then(() => {
          this.email = "";
          this.router.go(-1);
          this.loader.hideLoading();
          
          this.store.dispatch("showAlert", {
            message:
              "За да промените паролата отворете връзката получена на Вашия имейл адрес.",
          });
        })
        .catch((error) => {
          this.loader.hideLoading();

          this.store.dispatch("showAlert", {
            type: AlertType.ERROR,
            message: this.errorHandler.handleFirebaseError(error),
          });
        });
    },
  },
});
</script>

<style scoped>
.logoContainer {
  margin: auto;
  width: 344px;
  height: 155px;
}

.titleContainer {
  margin-top: 20px !important;
  margin-bottom: 20px !important;
  text-align: center !important;
}

.resetTitleLabel {
  font-size: 20px;
  font-weight: 500;
}

.fieldsContainer {
  margin: auto;
  padding: 16px;
}

.resetIonInput {
  border-bottom: 2px solid var(--tib-color-primary);
}

.backButtonContainer {
  margin-top: 32px;
}

.backButton {
  --color: var(--tib-color-primary);
}
</style>
