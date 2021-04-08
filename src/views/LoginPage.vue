<template>
  <ion-page>
    <ion-content>
      <div style="height: 15%"></div>
      <div class="logoContainer">
        <ion-img src="/assets/logo.png"></ion-img>
      </div>
      <div class="contentContainer">
        <div class="allFieldsContainer">
          <!-- Email -->
          <div class="fieldContainer">
            <ion-label class="fieldContainerLabel">Потребител:</ion-label>
            <ion-input
              class="loginIonInput"
              type="email"
              placeholder="Въведете имейл адрес"
              v-model="user.email"
              @keyup.enter="hideKeyboard($event.target)"
            >
            </ion-input>
          </div>
          <!-- Password -->
          <div class="fieldContainer">
            <ion-label class="fieldContainerLabel">Парола:</ion-label>
            <ion-input
              class="loginIonInput"
              type="password"
              placeholder="Въведете вашата парола"
              v-model="user.password"
              @keyup.enter="tryLogin()"
            >
            </ion-input>
          </div>
        </div>
      </div>
      <div class="buttonsContainer">
        <div>
          <!-- Login button -->
          <ion-button class="actionButton" @click="tryLogin()">Вход</ion-button>
        </div>
        <div class="registrationButtonContainer">
          <!-- Registration button -->
          <ion-button
            class="registrationButton"
            fill="clear"
            @click="() => router.push('/registration')"
          >
            Регистрация
          </ion-button>
        </div>
        <div class="resetPasswordButtonContainer">
          <!-- Reset password button -->
          <ion-button
            class="resetPasswordButton"
            fill="clear"
            @click="() => router.push('/reset-password')"
          >
            Забравена парола
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonButton, IonLabel, IonInput, IonContent, IonPage, IonImg } from "@ionic/vue";

import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { AlertType, useStore } from "@/store";
import { UserBuilder } from "@/store/modules/user/user.builder";
import { ApiClient } from "@/services/api.client";
import { Loader } from "@/services/loader";
import { Plugins } from "@capacitor/core";
import { Validator } from "@/services/validator";
import { ErrorHandler, ErrorCommon } from "@/services/error-handler";
import { LocalStorageKeys } from "@/store/local-storage-keys";

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
    const client = new ApiClient();
    const loader = new Loader();
    const validator = new Validator();
    const errorHandler = new ErrorHandler();

    return { store, router, client, loader, validator, errorHandler };
  },
  data() {
    return {
      user: {
        email: "",
        password: "",
      },
    };
  },
  mounted() {
    this.getLoginCredentialsEmail();
  },
  methods: {
    getLoginCredentialsEmail() {
      const loginEmail = localStorage.getItem(LocalStorageKeys.loginEmail);

      if (loginEmail) {
        this.user.email = loginEmail;
      }
    },
    hideKeyboard(sender: HTMLIonInputElement) {
      sender?.blur();

      const { Keyboard } = Plugins;
      Keyboard.hide();
    },
    getUserDetails() {
      this.client
        .getUserDetails(this.store.getters["user/firebaseJwt"])
        .then((response) => {
          this.store.commit("user/setUserDetails", response);
          this.user.password = "";
          this.loader.hideLoading();
          this.$router.push("/home");
        })
        .catch((error) => {
          this.loader.hideLoading();
          this.showErrorMessage(this.errorHandler.handleAPIError(error.response.data));
        });
    },
    async showErrorMessage(message: string) {
      await this.store.dispatch("showAlert", {
        type: AlertType.ERROR,
        message: message,
      });
    },
    handleFirebaseError(error: firebase.auth.AuthError) {
      this.loader.hideLoading();
      this.showErrorMessage(this.errorHandler.handleFirebaseError(error));
    },
    async tryLogin() {
      if (!this.validator.validateEmail(this.user.email)) {
        await this.showErrorMessage(ErrorCommon.invalidEmail);
        return;
      }

      if (!this.validator.validatePassword(this.user.password)) {
        await this.showErrorMessage(ErrorCommon.wrongPassword);
        return;
      }

      this.loader.showLoading();

      firebase
        .auth()
        .signInWithEmailAndPassword(this.user.email, this.user.password)
        .then((signInResponse) => {
          const _user = signInResponse.user;

          // Get user id token
          if (_user) {
            if (_user.emailVerified) {
              _user
                .getIdToken()
                .then((tokenReponse) => {
                  const newUser = new UserBuilder().makeUser(_user.uid, tokenReponse);

                  this.store.commit("user/setUser", newUser);
                  this.getUserDetails();
                })
                .catch((error) => {
                  this.handleFirebaseError(error);
                });
            } else {
              _user
                .sendEmailVerification()
                .then(() => {
                  this.loader.hideLoading();
                  
                  this.store.dispatch("showAlert", {
                    message: "За да продължите трябва да потвърдите имейл адреса си",
                  });
                })
                .catch((error) => {
                  this.loader.hideLoading();
                  this.showErrorMessage(this.errorHandler.handleFirebaseError(error));
                });
            }
          }
        })
        .catch((error) => {
          this.handleFirebaseError(error);
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

.fieldsContainer {
  margin: auto;
  padding: 16px;
}

.loginIonInput {
  border-bottom: 2px solid var(--tib-color-primary);
}

.registrationButtonContainer {
  margin-top: 32px;
}

.registrationButton {
  --color: var(--tib-color-primary);
}

.resetPasswordButtonContainer {
  margin-top: 16px;
}

.resetPasswordButton {
  --color: var(--tib-color-primary);
  font-size: 12px;
}
</style>
