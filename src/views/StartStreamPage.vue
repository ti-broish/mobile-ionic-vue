<template>
  <ion-page>
    <ion-content>
      <menu-component></menu-component>

      <div class="contentContainer">
        <div class="titleContainer">
          <ion-label class="titleLabel"
            >Ти броиш <span class="ti-broish-live">LIVE</span></ion-label
          >
        </div>
        <div class="countryContainer">
          <country-component
            @did-change-country="didChangeCountry($event)"
          ></country-component>
        </div>

        <div class="allFieldsContainer">
          <div v-show="countryIsNotAbroad">
            <!-- Election region -->
            <picker-select-component
              pTitle="МИР"
              @select-picker-item="didSelectElectionRegion($event)"
              :pData="pickerData.electionRegions"
              pPickerType="electionRegion"
              :pRequired="true"
            >
            </picker-select-component>

            <!-- Municipality -->
            <picker-select-component
              pTitle="Община"
              @select-picker-item="didSelectMunicipality($event)"
              :pData="pickerData.municipalities"
              pPickerType="municipality"
              :pRequired="true"
            >
            </picker-select-component>

            <!-- Town -->
            <picker-select-component
              pTitle="Населено място"
              @select-picker-item="didSelectTown($event)"
              :pData="pickerData.towns"
              pPickerType="town"
              :pRequired="true"
            >
            </picker-select-component>

            <!-- City region -->
            <picker-select-component
              v-show="!electionRegionIsHidden"
              pTitle="Район"
              @select-picker-item="didSelectCityRegion($event)"
              :pData="pickerData.cityRegions"
              pPickerType="cityRegion"
              :pRequired="true"
            >
            </picker-select-component>
          </div>

          <div v-show="!countryIsNotAbroad">
            <!-- Country -->
            <picker-select-component
              pTitle="Държава"
              @select-picker-item="didSelectCountry($event)"
              :pData="pickerData.countries"
              pPickerType="country"
              :pRequired="true"
            >
            </picker-select-component>

            <!-- Town -->
            <picker-select-component
              pTitle="Населено място"
              @select-picker-item="didSelectTown($event)"
              :pData="pickerData.towns"
              pPickerType="town"
              :pRequired="true"
            >
            </picker-select-component>
          </div>

          <!-- Section number -->
          <picker-select-component
            pTitle="Номер на секция"
            @select-picker-item="didSelectSection($event)"
            :pData="pickerData.sections"
            :pRequired="true"
            pPickerType="section"
          >
          </picker-select-component>

          <div class="sectionNumberContainer">
            <div class="sectionNumberLabelContainer">
              <ion-label
                >Единен номер на секция <span class="required">*</span></ion-label
              >
            </div>
            <div class="sectionNumberValueContainer">
              <ion-label class="sectionNumberValueLabel">{{ sectionNumber }}</ion-label>
            </div>
          </div>
        </div>

        <!-- Proceed button -->
        <div class="proceedButtonContainer">
          <ion-button
            class="actionButton"
            @click="proceedAct()"
            :disabled="sectionNumber.length === 0"
            >ПРОДЪЛЖИ</ion-button
          >
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonPage, IonContent, IonLabel, IonButton } from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { AlertType, useStore } from "@/store";
import { ApiClient } from "@/services/api.client";
import { Loader } from "@/services/loader";
import { RequestData } from "@/store/modules/request-data";
import { Country } from "@/store/modules/countries/types";
import { ElectionRegion, Municipality } from "@/store/modules/election-regions/types";
import { Town, CityRegion } from "@/store/modules/towns/types";
import { Section } from "@/store/modules/sections/types";
import { ErrorHandler, ErrorCommon } from "@/services/error-handler";
import { Plugins, Capacitor } from "@capacitor/core";

import MenuComponent from "@/components/MenuComponent.vue";
import CountryComponent from "@/components/CountryComponent.vue";
import PickerSelectComponent from "@/components/PickerSelectComponent.vue";

export default defineComponent({
  name: "SendStreamPage",
  components: {
    IonPage,
    IonContent,
    IonLabel,
    IonButton,
    MenuComponent,
    CountryComponent,
    PickerSelectComponent,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const client = new ApiClient();
    const loader = new Loader();
    const errorHandler = new ErrorHandler();

    return { store, router, client, loader, errorHandler };
  },
  data() {
    return {
      pickerData: {
        countries: [] as Array<Country>,
        electionRegions: [] as Array<ElectionRegion>,
        municipalities: [] as Array<Municipality>,
        towns: [] as Array<Town>,
        cityRegions: [] as Array<CityRegion>,
        sections: [] as Array<Section>,
      },
      countryIsNotAbroad: true,
      sectionNumber: "",
      electionRegionIsHidden: true,
      requestData: {} as RequestData,
    };
  },
  watch: {
    countryIsNotAbroad: "toggleUI",
  },
  async mounted() {
    this.getInitialData();
  },
  methods: {
    getInitialData() {
      this.getCountries();
      this.getElectionRegions();
    },
    currentUser() {
      return this.store.getters["user/currentUser"];
    },
    preselectDefaultCountry() {
      if (this.countryIsNotAbroad) {
        const matchedCountries = this.pickerData.countries.filter(function (el) {
          return el.name === "България";
        });

        if (matchedCountries.length === 1) {
          this.requestData.country = matchedCountries[0];
        }
      }
    },
    resetPickerData() {
      if (this.countryIsNotAbroad) {
        this.pickerData.countries = [];
      }
      this.pickerData.electionRegions = [];
      this.pickerData.municipalities = [];
      this.pickerData.towns = [];
      this.pickerData.cityRegions = [];
      this.pickerData.sections = [];
    },
    resetRequestData() {
      this.requestData.country = undefined;
      this.requestData.electionRegion = undefined;
      this.requestData.municipality = undefined;
      this.requestData.town = undefined;
      this.requestData.cityRegion = undefined;
      this.requestData.section = undefined;
    },
    resetData() {
      this.resetPickerData();
      this.resetRequestData();

      this.sectionNumber = "";
    },
    didChangeCountry(isNotAbroad: boolean) {
      this.countryIsNotAbroad = isNotAbroad;
    },
    toggleUI() {
      this.resetData();
      this.getCountries();

      if (this.countryIsNotAbroad) {
        this.getElectionRegions();
      }

      this.$forceUpdate;
    },
    async tryOpenLiveApp() {
      const bundleId =
        Capacitor.platform === "android"
          ? "android-app-id-live"
          : "ios-app-id-live";

      const { App } = Plugins;
      const canOpenUrl = await App.canOpenUrl({ url: bundleId });
      const websiteUrl = "https://tibroish.bg/";

      if (canOpenUrl) {
        await App.openUrl({ url: bundleId })
          .then((response) => {
            if (!response["completed"]) {
              App.openUrl({ url: websiteUrl });
            }
          })
          .catch(() => {
            App.openUrl({ url: websiteUrl });
          });
      } else {
        await App.openUrl({ url: websiteUrl });
      }
    },
    async proceedAct() {
      await this.loader.showLoading();

      this.client
        .sendStartStream(this.currentUser(), this.requestData.section)
        .then((response) => {
          this.loader.hideLoading();
          this.resetData();

          if (response.id) {
            this.tryOpenLiveApp();
          } else {
            this.store.dispatch("showAlert", {
              message: ErrorCommon.defaultError,
              type: AlertType.ERROR,
            });
          }
        })
        .catch((error) => {
          this.loader.hideLoading();

          this.store.dispatch("showAlert", {
            message: this.errorHandler.handleAPIError(error.response.data),
            type: AlertType.ERROR,
          });
        });
    },
    //
    // API methods
    getCountries() {
      this.client
        .getCountires(this.currentUser(), !this.countryIsNotAbroad)
        .then((response) => {
          this.pickerData.countries = response;
          this.preselectDefaultCountry();
        })
        .catch(() => {
          // Handle getCountries error
        });
    },
    getElectionRegions() {
      this.client
        .getElectionRegions(this.currentUser(), !this.countryIsNotAbroad)
        .then((response) => {
          this.pickerData.electionRegions = response;
        })
        .catch(() => {
          // Handle getElectionRegions error
        });
    },
    getTowns() {
      const countryCode = this.requestData.country?.code;

      if (countryCode) {
        this.client
          .getTowns(
            this.currentUser(),
            countryCode,
            this.requestData.electionRegion?.code,
            this.requestData.municipality?.code
          )
          .then((response) => {
            this.pickerData.towns = response;
          })
          .catch(() => {
            // Handle getTowns error
          });
      } else {
        this.store.dispatch("showAlert", {
          type: AlertType.ERROR,
          message: ErrorCommon.invalidCountry,
        });
      }
    },
    getAbroadTowns() {
      const countryCode = this.requestData.country?.code;

      if (countryCode) {
        this.client
          .getTowns(this.currentUser(), countryCode)
          .then((response) => {
            this.pickerData.towns = response;
          })
          .catch(() => {
            // Handle getTowns error
          });
      } else {
        this.store.dispatch("showAlert", {
          type: AlertType.ERROR,
          message: ErrorCommon.invalidCountry,
        });
      }
    },
    getSections() {
      const townId = this.requestData.town?.id;

      if (townId) {
        this.client
          .getSections(this.currentUser(), townId, this.requestData.cityRegion?.code)
          .then((response) => {
            this.pickerData.sections = response;
          })
          .catch(() => {
            // Handle getSections error
          });
      } else {
        this.store.dispatch("showAlert", {
          type: AlertType.ERROR,
          message: ErrorCommon.invalidTown,
        });
      }
    },
    //
    // Picker methods
    resetElectionRegionFields() {
      this.pickerData.towns = [];
      this.pickerData.cityRegions = [];
      this.pickerData.sections = [];
      this.requestData.municipality = undefined;
      this.requestData.town = undefined;
      this.requestData.cityRegion = undefined;
      this.requestData.section = undefined;
      this.sectionNumber = "";
    },
    didSelectElectionRegion(item: ElectionRegion) {
      this.requestData.electionRegion = item;
      // reset dependent fields
      this.resetElectionRegionFields();

      this.pickerData.municipalities = item.municipalities.sort(function (lhs, rhs) {
        if (lhs.name < rhs.name) {
          return -1;
        }
        if (lhs.name > rhs.name) {
          return 1;
        }
        return 0;
      });
    },
    resetMunicipalityFields() {
      this.pickerData.towns = [];
      this.pickerData.cityRegions = [];
      this.pickerData.sections = [];
      this.requestData.town = undefined;
      this.requestData.cityRegion = undefined;
      this.requestData.section = undefined;
      this.sectionNumber = "";
    },
    didSelectMunicipality(item: Municipality) {
      this.requestData.municipality = item;
      // reset dependent fields
      this.resetMunicipalityFields();
      this.getTowns();
    },
    resetTownFields() {
      this.pickerData.cityRegions = [];
      this.pickerData.sections = [];
      this.requestData.cityRegion = undefined;
      this.requestData.section = undefined;
      this.sectionNumber = "";
    },
    didSelectTown(item: Town) {
      this.requestData.town = item;
      // reset dependent fields
      this.resetTownFields();

      if (item.cityRegions && item.cityRegions.length > 0) {
        this.pickerData.cityRegions = item.cityRegions;
        this.electionRegionIsHidden = false;
      } else {
        this.electionRegionIsHidden = true;
        this.requestData.cityRegion = { code: "", name: item.name };
        this.getSections();
      }
    },
    resetCityRegionFields() {
      this.pickerData.sections = [];
      this.requestData.section = undefined;
      this.sectionNumber = "";
    },
    didSelectCityRegion(item: CityRegion) {
      this.requestData.cityRegion = item;
      // reset dependent fields
      this.resetCityRegionFields();
      this.getSections();
    },
    didSelectSection(item: Section) {
      this.requestData.section = item;
      this.sectionNumber = item.id;
    },
    didSelectCountry(item: Country) {
      this.resetData();
      this.requestData.country = item;
      this.getAbroadTowns();
    },
  },
});
</script>
