<template>
  <ion-app>
    <ion-menu side="start" menu-id="mainMenu" id="mainMenu" content-id="menuContent">
      <ion-header>
        <ion-toolbar class="menuToolbar" translucent>
          <ion-title class="menuTitle" @click="showHome()">Меню</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item class="ionItem" @click="showUserDetails()">
            <ion-label>Профил</ion-label>
          </ion-item>
          <ion-item class="ionItem" @click="sendProtocol()">
            <ion-label>Изпрати протокол</ion-label>
          </ion-item>
          <ion-item class="ionItem" @click="sendSignal()">
            <ion-label>Изпрати сигнал</ion-label>
          </ion-item>
          <ion-item class="ionItem" @click="getProtocols()">
            <ion-label>Моите протоколи</ion-label>
          </ion-item>
          <ion-item class="ionItem" @click="getViolations()">
            <ion-label>Моите сигнали</ion-label>
          </ion-item>
          <ion-item class="ionItem" @click="showTerms()">
            <ion-label>Права и задължения</ion-label>
          </ion-item>
          <ion-item class="ionItem" @click="showStartStream()">
            <ion-label>Ти броиш <span class="ti-broish-live">LIVE</span></ion-label>
          </ion-item>
          <ion-item @click="tryLogout()" lines="none">
            <ion-label>Изход</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-router-outlet id="menuContent"></ion-router-outlet>
  </ion-app>
</template>

<script lang="ts">
import {
  IonApp,
  IonRouterOutlet,
  IonTitle,
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/vue";

import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useStore, AlertType } from "@/store";
import { menuController, useBackButton, alertController } from "@ionic/vue";

import { UserActions } from "@/store/modules/user/actions-types";
import { Plugins, AppState } from "@capacitor/core";

import firebase from "firebase";

export default defineComponent({
  name: "App",
  components: {
    IonApp,
    IonRouterOutlet,
    IonTitle,
    IonMenu,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const { App } = Plugins;

    useBackButton(10, () => {
      if (store.getters["user/isLoggedIn"]) {
        if (router.currentRoute.value.name === "Parties") {
          alertController
            .create({
              header: "",
              message:
                "Въведените данни не са изпратени и няма да бъдат записани. Желаете ли изход от екрана?",
              buttons: [
                {
                  text: "Не",
                  role: "cancel",
                },
                {
                  text: "Да",
                  handler: () => {
                    router.replace("/home");
                  },
                },
              ],
            })
            .then((alert) => {
              alert.present();
            });
        } else if (router.currentRoute.value.name === "Protocol details") {
          router.go(-1);
        } else if (router.currentRoute.value.name === "Home") {
          App.exitApp();
        } else {
          router.replace("/home");
        }
      } else {
        if (router.currentRoute.value.path === "/registration") {
          router.go(-1);
        } else if (router.currentRoute.value.path === "/reset-password") {
          router.go(-1);
        } else {
          App.exitApp();
        }
      }
    });

    firebase.auth().onIdTokenChanged((user) => {
      if (store.getters["user/isLoggedIn"]) {
        const _user = user;

        if (_user) {
          _user
            .getIdToken()
            .then((tokenReponse) => {
              const currentJwt = store.getters["user/firebaseJwt"];

              if (currentJwt !== tokenReponse) {
                store.commit("user/setFirebaseJwt", tokenReponse);
              }
            })
            .catch(() => {
              store.dispatch(`user/${UserActions.LOGOUT}`).then(() => {
                router.replace({ path: "/login" });
                menuController.close();
              });

              store.dispatch("showAlert", {
                type: AlertType.ERROR,
                message: "Невалиден токен. Моля влезте отново.",
              });
            });
        }
      }
    });

    App.addListener("appStateChange", (state: AppState) => {
      if (!store.getters["user/isLoggedIn"]) {
        return;
      }

      if (state.isActive) {
        firebase
          .auth()
          .currentUser?.getIdToken()
          .then((tokenReponse) => {
            if (store) {
              store.commit("user/setFirebaseJwt", tokenReponse);
            }
          })
          .catch(() => {
            if (store) {
              store.dispatch("showAlert", {
                type: AlertType.ERROR,
                message: "Невалиден токен. Моля влезте отново.",
              });
            }
          });
      }
    });

    return { router, store };
  },
  methods: {
    async closeMenu() {
      await menuController.close();
    },
    resetStoredData() {
      this.store.commit("photos/setPhotos", []);
      this.store.commit("protocols/resetState");
      this.store.commit("violations/resetState");
    },
    showHome() {
      this.resetStoredData();
      this.$router.replace({ path: "/home" });
      this.closeMenu();
    },
    showUserDetails() {
      this.resetStoredData();
      this.$router.replace({ path: "/me" });
      this.closeMenu();
    },
    sendProtocol() {
      this.resetStoredData();
      this.$router.replace({ path: "/home/send-protocol" });
      this.closeMenu();
    },
    getProtocols() {
      this.resetStoredData();
      this.$router.replace({ path: "/home/protocols" });
      this.closeMenu();
    },
    sendSignal() {
      this.resetStoredData();
      this.$router.replace({ path: "/home/send-violation" });
      this.closeMenu();
    },
    getViolations() {
      this.resetStoredData();
      this.$router.replace({ path: "/home/violations" });
      this.closeMenu();
    },
    showTerms() {
      this.resetStoredData();
      this.$router.replace({ path: "/home/terms" });
      this.closeMenu();
    },
    showStartStream() {
      this.resetStoredData();
      this.$router.replace({ path: "/home/start-stream" });
      this.closeMenu();
    },
    logOut() {
      this.store.dispatch(`user/${UserActions.LOGOUT}`).then(() => {
        this.$router.replace({ path: "/login" });
        this.closeMenu();
      });
    },
    tryLogout() {
      if (this.router.currentRoute.value.name === "Parties") {
        alertController
          .create({
            header: "",
            message:
              "Въведените данни не са изпратени и няма да бъдат записани. Желаете ли изход от екрана?",
            buttons: [
              {
                text: "Не",
                role: "cancel",
              },
              {
                text: "Да",
                handler: () => {
                  this.logOut();
                },
              },
            ],
          })
          .then((alert) => {
            alert.present();
          });
      } else {
        this.logOut();
      }
    },
  },
});
</script>

<style scoped>
.menuToolbar {
  --background: var(--tib-color-tertiary);
}

.menuTitle {
  --color: #ffffff;
}

.ionItem {
  --border-color: var(--tib-color-tertiary);
}
</style>
