<template>
  <ion-page>
    <ion-content>
      <menu-component></menu-component>

      <div class="contentContainer">
        <div class="titleContainer">
          <ion-label class="titleLabel">ИЗПРАТИ СИГНАЛ</ion-label>
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
            pPickerType="section"
          >
          </picker-select-component>

          <div class="sectionNumberContainer" v-show="sectionNumber != 0">
            <div class="sectionNumberLabelContainer">
              <ion-label>Единен номер на секция</ion-label>
            </div>
            <div class="sectionNumberValueContainer">
              <ion-label class="sectionNumberValueLabel"> {{ sectionNumber }}</ion-label>
            </div>
          </div>

          <div class="violationDescription">
            <ion-label>Описание на нарушението<span class="required">*</span></ion-label>
            <div class="descriptionTextArea">
              <ion-textarea
                placeholder="Опишете нарушението. Моля въведете повече от 20 символа."
                v-model="descriptionText"
                enterkeyhint="done"
                @keyup.enter="hideKeyboard($event.target)"
              ></ion-textarea>
            </div>
          </div>
        </div>

        <!-- Photos -->
        <selected-photos-component
          @show-photo-gallery="showPhotos()"
          @take-photo="takePhoto()"
          @delete-selected-photo="deleteSelectedPhoto($event)"
          :pSelectedPhotos="selectedPhotos"
          :pRequired="false"
        >
        </selected-photos-component>

        <!-- Proceed button -->
        <div class="proceedButtonContainer">
          <ion-button
            class="actionButton"
            @click="proceedAct()"
            :disabled="descriptionText.length === 0"
            >ИЗПРАТИ</ion-button
          >
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonPage, IonLabel, IonButton, IonTextarea } from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { AlertType, useStore } from "@/store";
import { ApiClient } from "@/services/api.client";
import { Loader } from "@/services/loader";
import { Country } from "@/store/modules/countries/types";
import { ElectionRegion, Municipality } from "@/store/modules/election-regions/types";
import { Town, CityRegion } from "@/store/modules/towns/types";
import { Section } from "@/store/modules/sections/types";
import { Photo, UploadPhoto } from "@/store/modules/photos/types";
import { ViolationData } from "@/store/modules/violations/types";
import { usePhotoLibrary } from "@/composables/usePhotoLibrary";
import { Plugins } from "@capacitor/core";

import MenuComponent from "@/components/MenuComponent.vue";
import CountryComponent from "@/components/CountryComponent.vue";
import PickerSelectComponent from "@/components/PickerSelectComponent.vue";
import SelectedPhotosComponent from "@/components/SelectedPhotosComponent.vue";
import { ErrorCommon, ErrorViolation } from "@/services/error-handler";

export default defineComponent({
  name: "SendViolationPage",
  components: {
    IonContent,
    IonPage,
    IonLabel,
    IonButton,
    IonTextarea,
    MenuComponent,
    CountryComponent,
    PickerSelectComponent,
    SelectedPhotosComponent,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const client = new ApiClient();
    const loader = new Loader();
    const {
      photos,
      takePhoto,
      showPhotos,
      deletePhoto,
      deletePhotos,
    } = usePhotoLibrary();

    return {
      store,
      router,
      client,
      loader,
      photos,
      takePhoto,
      showPhotos,
      deletePhoto,
      deletePhotos,
    };
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
      violationData: { data: {} } as ViolationData,
      sectionNumber: "",
      electionRegionIsHidden: true,
      selectedPhotos: [] as Array<Photo>,
      uploadedPhotos: [] as Array<UploadPhoto>,
      descriptionText: "",
    };
  },
  watch: {
    countryIsNotAbroad: "toggleUI",
    photos: "didTakePhoto",
  },
  mounted() {
    this.getInitialData();
  },
  methods: {
    hideKeyboard(sender: HTMLIonTextElement) {
      sender?.blur();

      const { Keyboard } = Plugins;
      Keyboard.hide();
    },
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
          this.violationData.data.country = matchedCountries[0];
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
    resetViolationData() {
      this.violationData.data.country = undefined;
      this.violationData.data.electionRegion = undefined;
      this.violationData.data.municipality = undefined;
      this.violationData.data.town = undefined;
      this.violationData.data.cityRegion = undefined;
      this.violationData.data.section = undefined;
      this.violationData.description = "";
    },
    async resetData() {
      this.resetPickerData();
      this.resetViolationData();

      this.sectionNumber = "";
      this.descriptionText = "";
      this.selectedPhotos = [];
      this.uploadedPhotos = [];
      this.photos.length = 0;
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
    //
    // Photos
    showPhotoGallery() {
      this.$router.push("/photos");
    },
    reloadSelectedPhotos() {
      this.selectedPhotos = this.store.getters["photos/getPhotos"];
    },
    didTakePhoto() {
      if (this.photos.length > 0) {
        const allPhotos = this.selectedPhotos.concat(this.photos);

        let index = 0;
        allPhotos.forEach(function (photo) {
          photo.index = index++;
        });

        this.store.commit("photos/setPhotos", allPhotos);
        this.photos.length = 0;
      }

      this.reloadSelectedPhotos();
    },
    deleteSelectedPhoto(photo: Photo) {
      this.deletePhoto(photo);
      this.store.commit("photos/deletePhoto", photo);
    },
    async trySendViolation() {
      try {
        this.store.commit("photos/setUploadPhotos", this.uploadedPhotos);
        this.uploadedPhotos = [];

        const response = await this.sendViolation();

        this.store.commit("photos/resetState");
        this.store.commit("violations/resetState");
        await this.loader.hideLoading();

        if (response && response.status === "received" && response.id) {
          this.resetData();
          this.getInitialData();

          await this.store.dispatch("showAlert", {
            message: "Сигналът е изпратен успешно.",
            position: "top",
          });
        } else {
          throw new Error("Грешка при изпращането на сигнала.");
        }
      } catch (error) {
        await this.loader.hideLoading();

        await this.store.dispatch("showAlert", {
          message: "Грешка при изпращането на сигнала.",
          type: AlertType.ERROR,
        });
      }
    },
    validateModel() {
      const errors = [];

      if (this.countryIsNotAbroad) {
        if (
          !this.violationData.data.electionRegion ||
          this.violationData.data.electionRegion.code === ""
        ) {
          errors.push(ErrorViolation.electionRegion);
        }

        if (
          !this.violationData.data.municipality ||
          this.violationData.data.municipality.code === ""
        ) {
          errors.push(ErrorViolation.municipality);
        }

        if (!this.violationData.data.town || this.violationData.data.town.id <= 0) {
          errors.push(ErrorViolation.town);
        } else {
          if (this.violationData.data.town?.cityRegions) {
            if (
              this.violationData.data.town.cityRegions.length > 0 &&
              (!this.violationData.data.cityRegion ||
                this.violationData.data.cityRegion.code === "")
            ) {
              errors.push(ErrorViolation.cityRegion);
            }
          }
        }
      } else {
        if (
          !this.violationData.data.country ||
          this.violationData.data.country.code === ""
        ) {
          errors.push(ErrorViolation.country);
        }

        if (!this.violationData.data.town || this.violationData.data.town.id <= 0) {
          errors.push(ErrorViolation.town);
        }
      }

      if (this.descriptionText.length < 20) {
        errors.push(ErrorViolation.description);
      }

      return errors;
    },
    async proceedAct() {
      const errors = this.validateModel();

      if (errors.length > 0) {
        await this.store.dispatch("showAlert", {
          message: errors[0],
          type: AlertType.ERROR,
        });
        return;
      }

      await this.loader.showLoading();

      if (this.selectedPhotos.length === 0) {
        await this.trySendViolation();
      } else {
        await this.uploadSelectedPhotos();

        // if all selected photos successfully uploaded, submit protocol
        if (this.uploadedPhotos.length === this.selectedPhotos.length) {
          await this.deletePhotos(this.selectedPhotos);
          await this.trySendViolation();
        }
      }
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
          // Handle getCountires error
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
      const countryCode = this.violationData.data.country?.code;

      if (countryCode) {
        this.client
          .getTowns(
            this.currentUser(),
            countryCode,
            this.violationData.data.electionRegion?.code,
            this.violationData.data.municipality?.code
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
      const countryCode = this.violationData.data.country?.code;

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
      const townId = this.violationData.data.town?.id;

      if (townId) {
        this.client
          .getSections(
            this.currentUser(),
            townId,
            this.violationData.data.cityRegion?.code
          )
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
    uploadPhoto(photo: Photo) {
      return this.client.uploadPhoto(this.currentUser(), photo);
    },
    uploadSelectedPhotos() {
      return Promise.all(this.selectedPhotos.map((photo) => this.uploadPhoto(photo)))
        .then((response) => {
          this.uploadedPhotos = response;
        })
        .catch(() => {
          this.loader.hideLoading();

          this.store.dispatch("showAlert", {
            message: ErrorCommon.uploadPhotoError,
            type: AlertType.ERROR,
          });
        });
    },
    sendViolation() {
      this.violationData.data.pictures = this.store.getters["photos/getUploadPhotos"];
      this.violationData.description = this.descriptionText;
      this.store.commit("violations/setViolationData", this.violationData);

      const town = this.violationData.data.town;
      const pictures = this.violationData.data.pictures
        ?.sort(function (lhs: UploadPhoto, rhs: UploadPhoto) {
          if (lhs.index < rhs.index) {
            return -1;
          }
          if (lhs.index > rhs.index) {
            return 1;
          }
          return 0;
        })
        .map(function (val) {
          return val.id;
        });

      if (town && pictures) {
        return this.client.sendViolation(
          this.currentUser(),
          town,
          pictures,
          this.violationData.description,
          this.violationData.data.section
        );
      } else {
        this.loader.hideLoading();
        
        this.store.dispatch("showAlert", {
          type: AlertType.ERROR,
          message: "Невалиден град и/или снимки.",
        });
      }
    },
    //
    // Picker methods
    resetElectionRegionFields() {
      this.pickerData.towns = [];
      this.pickerData.cityRegions = [];
      this.pickerData.sections = [];
      this.violationData.data.municipality = undefined;
      this.violationData.data.town = undefined;
      this.violationData.data.cityRegion = undefined;
      this.violationData.data.section = undefined;
      this.sectionNumber = "";
    },
    didSelectElectionRegion(item: ElectionRegion) {
      this.violationData.data.electionRegion = item;
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
      this.violationData.data.town = undefined;
      this.violationData.data.cityRegion = undefined;
      this.violationData.data.section = undefined;
      this.sectionNumber = "";
    },
    didSelectMunicipality(item: Municipality) {
      this.violationData.data.municipality = item;
      // reset dependent fields
      this.resetMunicipalityFields();
      this.getTowns();
    },
    resetTownFields() {
      this.pickerData.cityRegions = [];
      this.pickerData.sections = [];
      this.violationData.data.cityRegion = undefined;
      this.violationData.data.section = undefined;
      this.sectionNumber = "";
    },
    didSelectTown(item: Town) {
      this.violationData.data.town = item;
      // reset dependent fields
      this.resetTownFields();

      if (item.cityRegions && item.cityRegions.length > 0) {
        this.pickerData.cityRegions = item.cityRegions;
        this.electionRegionIsHidden = false;
      } else {
        this.electionRegionIsHidden = true;
        this.violationData.data.cityRegion = { code: "", name: item.name };
        this.getSections();
      }
    },
    resetCityRegionFields() {
      this.pickerData.sections = [];
      this.violationData.data.section = undefined;
      this.sectionNumber = "";
    },
    didSelectCityRegion(item: CityRegion) {
      this.violationData.data.cityRegion = item;
      // reset dependent fields
      this.resetCityRegionFields();
      this.getSections();
    },
    didSelectSection(item: Section) {
      this.violationData.data.section = item;
      this.sectionNumber = item.id;
    },
    didSelectCountry(item: Country) {
      this.resetData();
      this.violationData.data.country = item;
      this.getAbroadTowns();
    },
  },
  ionViewWillEnter() {
    this.reloadSelectedPhotos();
  },
});
</script>

<style scoped>
.violationDescription {
  margin: auto;
  padding: 8px;
}

.descriptionTextArea {
  margin: auto;
  height: 150px;
  background-color: #ffffff;
}
</style>
