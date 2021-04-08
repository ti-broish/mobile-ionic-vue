<template>
  <ion-page>
    <ion-content>
      <menu-component></menu-component>

      <div class="contentContainer">
        <ion-list class="allFieldsContainer">
          <!-- First name -->
          <div class="fieldContainer">
            <div class="fieldContainerLabel">
              <ion-label>Име:</ion-label>
            </div>
            <ion-input
              class="ionInput"
              type="text"
              v-model="user.firstName"
              @keyup.enter="hideKeyboard($event.target)"
            >
            </ion-input>
          </div>
          <!-- Last name -->
          <div class="fieldContainer">
            <div class="fieldContainerLabel">
              <ion-label>Фамилия:</ion-label>
            </div>
            <ion-input
              class="ionInput"
              type="text"
              v-model="user.lastName"
              @keyup.enter="hideKeyboard($event.target)"
            >
            </ion-input>
          </div>
          <!-- Email -->
          <div class="fieldContainer">
            <div class="fieldContainerLabel">
              <ion-label>Имейл:</ion-label>
            </div>
            <ion-input
              class="ionInput"
              type="email"
              v-model="user.email"
              @keyup.enter="hideKeyboard($event.target)"
              :disabled="true"
            >
            </ion-input>
          </div>
          <!-- Phone -->
          <div class="fieldContainer">
            <div class="fieldContainerLabel">
              <ion-label>Телефон:</ion-label>
            </div>
            <ion-input
              class="ionInput"
              type="tel"
              v-model="user.phone"
              @keyup.enter="hideKeyboard($event.target)"
            >
            </ion-input>
          </div>
          <!-- Pin todo: ??? -->
          <!-- Organization -->
          <picker-select-component
            pTitle="Организация:"
            :pData="pickerData.organizations"
            @select-picker-item="handleSelectPickerItem($event)"
            :pSelectedItem="user.organization"
          >
          </picker-select-component>
          <!-- Password - todo button (new screen)? -->

          <!-- GDPR -->
          <div class="fieldContainer">
            <gdpr-component
              :pHasAgreedToKeepData="user.hasAgreedToKeepData"
              @has-agreed-to-keep-data="handleChangeGDPRValue($event)"
            ></gdpr-component>
          </div>
        </ion-list>
      </div>

      <div class="buttonsContainer">
        <div>
          <!-- Save button -->
          <ion-button class="actionButton" @click="saveProfile()">Запази</ion-button>
        </div>
        <div>
          <!-- Delete button -->
          <ion-button class="destructiveButton" @click="presentDeleteConfirm()"
            >Изтриване</ion-button
          >
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonPage, IonLabel, IonInput, alertController } from "@ionic/vue";
import { defineComponent } from "vue";
import { AlertType, useStore } from "@/store";
import { useRouter } from "vue-router";
import { Organization } from "@/store/modules/organizations/types";
import { ApiClient } from "@/services/api.client";
import { Loader } from "@/services/loader";
import { Plugins } from "@capacitor/core";
import { Validator } from "@/services/validator";
import { UserActions } from "@/store/modules/user/actions-types";
import { ErrorHandler, ErrorCommon } from "@/services/error-handler";

import MenuComponent from "@/components/MenuComponent.vue";
import PickerSelectComponent from "@/components/PickerSelectComponent.vue";
import GdprComponent from "@/components/GDPRComponent.vue";

export default defineComponent({
  name: "ProfilePage",
  components: {
    IonContent,
    IonPage,
    IonLabel,
    IonInput,
    MenuComponent,
    PickerSelectComponent,
    GdprComponent,
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
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        organization: {} as Organization,
        hasAgreedToKeepData: false,
      },
      pickerData: {
        organizations: [] as Array<Organization>,
      },
    };
  },
  mounted() {
    this.getOrganizations();
    this.loadProfile();
  },
  methods: {
    hideKeyboard(sender: HTMLIonInputElement) {
      sender?.blur();

      const { Keyboard } = Plugins;
      Keyboard.hide();
    },
    loadProfile() {
      this.client
        .getUserDetails(this.store.getters["user/firebaseJwt"])
        .then((response) => {
          this.store.commit("user/setUserDetails", response);
          this.user.firstName = this.store.getters["user/firstName"];
          this.user.lastName = this.store.getters["user/lastName"];
          this.user.email = this.store.getters["user/email"];
          this.user.phone = this.store.getters["user/phone"];
          this.user.organization = this.store.getters["user/organization"];
          this.user.hasAgreedToKeepData = this.store.getters["user/hasAgreedToKeepData"];
          this.loader.hideLoading();
        })
        .catch((error) => {
          this.loader.hideLoading();
          this.showErrorMessage(this.errorHandler.handleAPIError(error.response.data));
        });
    },
    handleSelectPickerItem(item: Organization) {
      this.user.organization = item;
      this.store.commit("user/setOrganization", item);
    },
    handleChangeGDPRValue(value: boolean) {
      this.user.hasAgreedToKeepData = value;
    },
    async showErrorMessage(message: string) {
      this.loader.hideLoading();

      await this.store.dispatch("showAlert", {
        type: AlertType.ERROR,
        message: message,
      });
    },
    showApiError(error: Error) {
      this.showErrorMessage(this.errorHandler.handleAPIError(error));
    },
    //
    // API methods
    getOrganizations() {
      this.client
        .getOrganizations()
        .then((response) => {
          this.pickerData.organizations = response;
        })
        .catch(() => {
          // Handle getOrganizations error
        });
    },
    validateModel() {
      const errors = [];

      if (!this.validator.validateName(this.user.firstName)) {
        errors.push(ErrorCommon.invalidFirstName);
      }

      if (!this.validator.validateName(this.user.lastName)) {
        errors.push(ErrorCommon.invalidLastName);
      }

      if (!this.validator.validateEmail(this.user.email)) {
        errors.push(ErrorCommon.invalidEmail);
      }

      if (!this.validator.validatePhone(this.user.phone)) {
        errors.push(ErrorCommon.invalidPhone);
      }

      if (!this.validator.validateOrganization(this.user.organization)) {
        errors.push(ErrorCommon.invalidOrganization);
      }

      return errors;
    },
    async saveProfile() {
      const errors = this.validateModel();

      if (errors.length > 0) {
        const error = errors[0];
        this.showErrorMessage(error);
      } else {
        const currentUser = this.store.getters["user/currentUser"];
        currentUser.userDetails.firstName = this.user.firstName;
        currentUser.userDetails.lastName = this.user.lastName;
        currentUser.userDetails.phone = this.user.phone;
        currentUser.userDetails.organization = this.user.organization;
        currentUser.userDetails.hasAgreedToKeepData = this.user.hasAgreedToKeepData;

        if (currentUser.firebaseJwt) {
          this.loader.showLoading();

          this.client
            .updateUserDetails(currentUser)
            .then((response) => {
              this.store.commit("user/setUserDetails", response);
              this.loader.hideLoading();

              this.store.dispatch("showAlert", {
                message: "Промените са запазени.",
              });
            })
            .catch((error) => {
              this.loader.hideLoading();
              this.showApiError(error.response.data);
            });
        } else {
          await this.showErrorMessage("Невалиден токен. Моля влезте отново.");
        }
      }
    },
    deleteProfile() {
      const user = this.store.getters["user/currentUser"];

      if (user.firebaseJwt) {
        this.loader.showLoading();

        this.client
          .deleteUser(user)
          .then((response) => {
            this.loader.hideLoading();

            if (response && response.status === 202) {
              this.store.dispatch(`user/${UserActions.LOGOUT}`).then(() => {
                this.$router.replace({ path: "/login" });

                this.store.dispatch("showAlert", {
                  message: "Успешно изтрихте личните си данни.",
                });
              });
            }
          })
          .catch((error) => {
            this.loader.hideLoading();
            this.showApiError(error.response.data);
          });
      }
    },
    async presentDeleteConfirm() {
      const alert = await alertController.create({
        header: "",
        message: "Потвърдете изтриване на профила",
        buttons: [
          {
            text: "Не",
            role: "cancel",
          },
          {
            text: "Да",
            handler: () => {
              this.deleteProfile();
            },
          },
        ],
      });
      return alert.present();
    },
  },
});
</script>

<style scoped>
ion-item {
  margin-top: 8px;
  padding: 8px;

  --background: white;
}
</style>
