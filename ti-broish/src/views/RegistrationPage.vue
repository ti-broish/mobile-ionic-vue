<template>
  <ion-page>
    <ion-content>
      <div class="contentContainer">
        <div class="titleContainer">
          <ion-label class="titleLabel">РЕГИСТРАЦИЯ</ion-label>
        </div>

        <div class="allFieldsContainer">
          <!-- First name -->
          <div class="fieldContainer">
            <div class="fieldContainerLabel">
              <ion-label>Име: <span class="required">*</span></ion-label>
            </div>
            <ion-input
              class="ionInput"
              type="text"
              placeholder="Въведете вашето име"
              v-model="user.firstName"
              @keyup.enter="hideKeyboard($event.target)"
            >
            </ion-input>
          </div>
          <!-- Last name -->
          <div class="fieldContainer">
            <div class="fieldContainerLabel">
              <ion-label>Фамилия: <span class="required">*</span></ion-label>
            </div>
            <ion-input
              class="ionInput"
              type="text"
              placeholder="Въведете вашата фамилия"
              v-model="user.lastName"
              @keyup.enter="hideKeyboard($event.target)"
            >
            </ion-input>
          </div>
          <!-- Email -->
          <div class="fieldContainer">
            <div class="fieldContainerLabel">
              <ion-label>Имейл: <span class="required">*</span></ion-label>
            </div>
            <ion-input
              class="ionInput"
              type="email"
              placeholder="Въведете вашия имейл"
              v-model="user.email"
              @keyup.enter="hideKeyboard($event.target)"
              @ionChange="resetFirebaseError()"
            >
            </ion-input>
          </div>
          <!-- Phone number -->
          <div class="fieldContainer">
            <div class="fieldContainerLabel">
              <ion-label>Телефон: <span class="required">*</span></ion-label>
            </div>
            <div class="phoneContainer">
              <picker-select-component
                id="pscCountryId"
                :pData="pickerData.phoneCodes"
                pPickerType="phone"
                :pRequired="true"
                @select-picker-item="handleSelectPhoneCountry($event)"
                :pSelectedItem="defaultCountryCode"
              >
              </picker-select-component>
              <ion-input
                class="ionInput"
                type="tel"
                placeholder="Въведете вашия телефон"
                v-model="user.phone.number"
                @keyup.enter="hideKeyboard($event.target)"
              >
              </ion-input>
            </div>
          </div>
          <!-- ID last four digits -->
          <div class="fieldContainer">
            <div class="fieldContainerLabel">
              <ion-label
                >Последни четири цифри на ЕГН: <span class="required">*</span></ion-label
              >
            </div>
            <ion-input
              class="ionInput"
              type="number"
              placeholder="Въведете последни четири цифри"
              maxlength="4"
              v-model="user.pin"
              @keyup.enter="hideKeyboard($event.target)"
            >
            </ion-input>
          </div>
          <!-- Organization -->
          <picker-select-component
            pTitle="Организация:"
            :pData="pickerData.organizations"
            @select-picker-item="handleSelectOrganization($event)"
            :pRequired="true"
          >
          </picker-select-component>
          <!-- Password -->
          <div class="fieldContainer">
            <div class="fieldContainerLabel">
              <ion-label>Парола: <span class="required">*</span></ion-label>
            </div>
            <ion-input
              class="ionInput"
              type="password"
              placeholder="Въведете вашата парола"
              v-model="user.password"
              @keyup.enter="hideKeyboard($event.target)"
            >
            </ion-input>
          </div>
          <!-- Confirm password -->
          <div class="fieldContainer">
            <div class="fieldContainerLabel">
              <ion-label>Потвърди парола: <span class="required">*</span></ion-label>
            </div>
            <ion-input
              class="ionInput"
              type="password"
              placeholder="Потвърдете вашата парола"
              v-model="user.confirmPassword"
              @keyup.enter="hideKeyboard($event.target)"
            >
            </ion-input>
          </div>

          <!-- keep data -->
          <!-- GDPR -->
          <div class="fieldContainer">
            <gdpr-component
              :pHasAgreedToKeepData="user.hasAgreedToKeepData"
              @has-agreed-to-keep-data="handleChangeGDPRValue($event)"
            ></gdpr-component>
          </div>

          <!-- Adulthood -->
          <div class="adulthood">
            <ion-checkbox
              class="ionCheckbox"
              v-model="user.hasAdulthood"
              checked="user.hasAdulthood"
            ></ion-checkbox>
            &nbsp;
            <ion-label
              >Имам навършени 18 години. <span class="required">*</span></ion-label
            >
          </div>
        </div>
      </div>

      <div class="buttonsContainer">
        <!-- Registration button -->
        <ion-button class="actionButton" @click="tryRegistration()">
          СЪЗДАЙ ПРОФИЛ
        </ion-button>
      </div>
      <!-- Login -->
      <div>
        <ion-button class="loginButton" fill="clear" router-link="/login">
          Вход
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonLabel,
  IonInput,
  IonContent,
  IonPage,
  IonCheckbox,
} from "@ionic/vue";

import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { ApiClient } from "@/services/api.client";
import { Loader } from "@/services/loader";
import { UserBuilder } from "@/store/modules/user/user.builder";
import { Organization } from "@/store/modules/organizations/types";
import { UserDetails } from "@/store/modules/user/types";
import { CountryPhoneCode } from "@/store/modules/countries/types";
import { Validator } from "@/services/validator";
import { ErrorHandler, ErrorCommon } from "@/services/error-handler";

import firebase from "firebase";
import PickerSelectComponent from "@/components/PickerSelectComponent.vue";
import { AlertType, useStore } from "@/store";
import { Plugins } from "@capacitor/core";
import * as phoneCodesJSON from "@/data/phone-codes.json";
import GdprComponent from "@/components/GDPRComponent.vue";

export default defineComponent({
  name: "RegistrationPage",
  components: {
    IonButton,
    IonLabel,
    IonInput,
    IonContent,
    IonPage,
    IonCheckbox,
    PickerSelectComponent,
    GdprComponent,
  },
  setup() {
    const router = useRouter();
    const client = new ApiClient();
    const loader = new Loader();
    const store = useStore();
    const validator = new Validator();
    const errorHandler = new ErrorHandler();

    return { router, client, loader, store, validator, errorHandler };
  },
  data() {
    return {
      user: {
        firstName: "",
        lastName: "",
        email: "",
        phone: {
          countryCode: "+359",
          number: "",
          getPhoneNumber: function () {
            return this.countryCode + this.number;
          },
        },
        pin: "",
        organization: {} as Organization,
        password: "",
        confirmPassword: "",
        hasAgreedToKeepData: false,
        hasAdulthood: false,
      },
      pickerData: {
        organizations: [] as Array<Organization>,
        phoneCodes: [] as Array<CountryPhoneCode>,
      },
      firebaseError: {} as firebase.auth.AuthError,
      defaultCountryCode: { code: "+359", name: "Bulgaria" },
    };
  },
  mounted() {
    this.getOrganizations();
    this.loadCountriesPhoneCodes();
  },
  methods: {
    hideKeyboard(sender: HTMLIonInputElement) {
      sender?.blur();

      const { Keyboard } = Plugins;
      Keyboard.hide();
    },
    resetFirebaseError() {
      this.firebaseError = {} as firebase.auth.AuthError;
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

      if (!this.validator.validatePhone(this.user.phone.getPhoneNumber())) {
        errors.push(ErrorCommon.invalidPhone);
      }

      if (!this.validator.validatePin(this.user.pin)) {
        errors.push(ErrorCommon.invalidPin);
      }

      if (!this.validator.validateOrganization(this.user.organization)) {
        errors.push(ErrorCommon.invalidOrganization);
      }

      if (!this.validator.validatePassword(this.user.password)) {
        errors.push(ErrorCommon.wrongPassword);
      } else if (
        !this.user.confirmPassword ||
        this.user.password != this.user.confirmPassword
      ) {
        errors.push(ErrorCommon.wrongConfirmPassword);
      }

      if (!this.user.hasAdulthood) {
        errors.push("Моля потвърдете, че имате навършени 18 години");
      }

      return errors;
    },
    async showErrorMessage(message: string) {
      this.loader.hideLoading();

      await this.store.dispatch("showAlert", {
        type: AlertType.ERROR,
        message: message,
      });
    },
    async redirectToLogin() {
      await this.store.dispatch("showAlert", {
        message:
          "Моля потвърдете регистрацията си с отваряне на връзката получена на Вашия имейл адрес.",
      });

      this.$router.go(-1);
    },
    registerUser(firebaseUser: firebase.User | null) {
      if (firebaseUser) {
        firebaseUser
          .getIdToken()
          .then((tokenReponse) => {
            const userDetails: UserDetails = {
              firstName: this.user.firstName,
              lastName: this.user.lastName,
              email: this.user.email,
              phone: this.user.phone.getPhoneNumber(),
              pin: this.user.pin,
              organization: this.user.organization,
              hasAgreedToKeepData: this.user.hasAgreedToKeepData,
            };

            const newUser = new UserBuilder().makeRegistrationUser(
              firebaseUser.uid,
              tokenReponse,
              userDetails
            );

            this.client
              .createUser(newUser)
              .then(() => {
                firebaseUser
                  .sendEmailVerification()
                  .then(() => {
                    this.loader.hideLoading();
                    this.redirectToLogin();
                  })
                  .catch((error) => {
                    this.loader.hideLoading();
                    this.showErrorMessage(this.errorHandler.handleFirebaseError(error));
                  });
              })
              .catch((error) => {
                this.showErrorMessage(
                  this.errorHandler.handleAPIError(error.response.data)
                );
              });
          })
          .catch((error) => {
            this.showErrorMessage(this.errorHandler.handleFirebaseError(error));
          });
      }
    },
    handleFirebaseError(error: firebase.auth.AuthError) {
      this.loader.hideLoading();
      this.firebaseError = error;
      this.showErrorMessage(this.errorHandler.handleFirebaseError(error));
    },
    signInWithEmailAndPassword() {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.user.email, this.user.password)
        .then((response) => {
          this.registerUser(response.user);
        })
        .catch((error) => {
          this.handleFirebaseError(error);
        });
    },
    async userRegistration() {
      await this.loader.showLoading();

      if (!this.firebaseError.code) {
        firebase
          .auth()
          .createUserWithEmailAndPassword(this.user.email, this.user.password)
          .then((response) => {
            this.registerUser(response.user);
          })
          .catch((error) => {
            this.firebaseError = error;

            this.handleFirebaseError(error);
          });
      } else if (this.firebaseError.code === "auth/email-already-in-use") {
        this.signInWithEmailAndPassword();
      } else {
        this.loader.hideLoading();
        this.handleFirebaseError(this.firebaseError);
      }
    },
    tryRegistration() {
      const errors = this.validateModel();

      if (errors.length > 0) {
        const error = errors[0];
        this.showErrorMessage(error);
      } else {
        this.userRegistration();
      }
    },
    handleSelectOrganization(organization: Organization) {
      this.user.organization = organization;
    },
    handleSelectPhoneCountry(country: CountryPhoneCode) {
      this.user.phone.countryCode = country.code;
    },
    handleChangeGDPRValue(value: boolean) {
      this.user.hasAgreedToKeepData = value;
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
    //
    // Local data methods
    loadCountriesPhoneCodes() {
      this.pickerData.phoneCodes = phoneCodesJSON.countries;
    },
  },
});
</script>

<style scoped>
.gdpr,
.adulthood {
  margin: auto;
  padding: 16px;
}

.ionCheckbox {
  top: 4px !important;
}

.ios .ionCheckbox {
  top: 8px !important;
}

.loginButton {
  --color: var(--tib-color-primary);
}

.phoneContainer {
  display: flex;
  flex-direction: row;
}

#pscCountryId {
  margin-left: -8px !important;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
