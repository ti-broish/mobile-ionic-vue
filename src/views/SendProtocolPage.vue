<template>
  <ion-page>
    <ion-content>
      <menu-component></menu-component>

      <div class="contentContainer">
        <div class="titleContainer">
          <ion-label class="titleLabel">ИЗПРАТИ ПРОТОКОЛ</ion-label>
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

        <!-- Photos -->
        <selected-photos-component
          @show-photo-gallery="showPhotos()"
          @take-photo="takePhoto()"
          @delete-selected-photo="deleteSelectedPhoto($event)"
          :pSelectedPhotos="selectedPhotos"
          :pRequired="true"
        >
        </selected-photos-component>

        <!-- Proceed button -->
        <div class="proceedButtonContainer">
          <ion-button
            class="actionButton"
            @click="proceedAct()"
            :disabled="sectionNumber.length === 0 || selectedPhotos.length === 0"
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
import { ProtocolData } from "@/store/modules/protocols/types";
import { Country } from "@/store/modules/countries/types";
import { ElectionRegion, Municipality } from "@/store/modules/election-regions/types";
import { Town, CityRegion } from "@/store/modules/towns/types";
import { Section } from "@/store/modules/sections/types";
import { Photo, UploadPhoto } from "@/store/modules/photos/types";
import { usePhotoLibrary } from "@/composables/usePhotoLibrary";

import MenuComponent from "@/components/MenuComponent.vue";
import CountryComponent from "@/components/CountryComponent.vue";
import PickerSelectComponent from "@/components/PickerSelectComponent.vue";
import SelectedPhotosComponent from "@/components/SelectedPhotosComponent.vue";
import { ErrorCommon } from "@/services/error-handler";

export default defineComponent({
  name: "SendProtocolPage",
  components: {
    IonPage,
    IonContent,
    IonLabel,
    IonButton,
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
      showPhotos,
      takePhoto,
      deletePhoto,
      deletePhotos,
    } = usePhotoLibrary();

    return {
      store,
      router,
      client,
      loader,
      photos,
      showPhotos,
      takePhoto,
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
      sectionNumber: "",
      electionRegionIsHidden: true,
      protocolData: { data: {} } as ProtocolData,
      selectedPhotos: [] as Array<Photo>,
      uploadedPhotos: [] as Array<UploadPhoto>,
    };
  },
  watch: {
    countryIsNotAbroad: "toggleUI",
    photos: "didTakePhoto",
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
          this.protocolData.data.country = matchedCountries[0];
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
    resetProtocolData() {
      this.protocolData.id = undefined;
      this.protocolData.data.country = undefined;
      this.protocolData.data.electionRegion = undefined;
      this.protocolData.data.municipality = undefined;
      this.protocolData.data.town = undefined;
      this.protocolData.data.cityRegion = undefined;
      this.protocolData.data.section = undefined;
    },
    resetData() {
      this.resetPickerData();
      this.resetProtocolData();

      this.sectionNumber = "";
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
    /**
     * Uploads photos and creates a protocol with them
     * Navigates to the next page for party result input
     */
    async proceedAct() {
      await this.loader.showLoading();
      await this.uploadSelectedPhotos();
      await this.deletePhotos(this.selectedPhotos);

      // if all selected photos successfully uploaded, submit protocol
      if (this.uploadedPhotos.length === this.selectedPhotos.length) {
        try {
          this.store.commit("photos/setUploadPhotos", this.uploadedPhotos);
          this.uploadedPhotos = [];

          const response = await this.sendProtocol();
          
          this.store.commit("photos/resetState");
          await this.loader.hideLoading();

          if (response && response.status === "received" && response.id) {
            this.protocolData.id = response.id;
            this.store.commit("protocols/setProtocolData", this.protocolData);
            // show success notice
            await this.store.dispatch("showAlert", {
              message: "Протоколът е изпратен успешно.",
              position: "top",
            });

            this.resetData();
            this.getInitialData();
            // go to next page
            await this.$router.push("/home/send-protocol/parties");
          } else {
            throw new Error("Грешка при изпращането на протокола.");
          }
        } catch (err) {
          await this.loader.hideLoading();

          await this.store.dispatch("showAlert", {
            message: "Грешка при изпращането на протокола.",
            type: AlertType.ERROR,
          });
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
      const countryCode = this.protocolData.data.country?.code;

      if (countryCode) {
        this.client
          .getTowns(
            this.currentUser(),
            countryCode,
            this.protocolData.data.electionRegion?.code,
            this.protocolData.data.municipality?.code
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
      const countryCode = this.protocolData.data.country?.code;

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
      const townId = this.protocolData.data.town?.id;

      if (townId) {
        this.client
          .getSections(
            this.currentUser(),
            townId,
            this.protocolData.data.cityRegion?.code
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
    sendProtocol() {
      this.protocolData.data.pictures = this.store.getters["photos/getUploadPhotos"];
      // update protocol in store
      this.store.commit("protocols/setProtocolData", this.protocolData);

      const section = this.protocolData.data.section;
      const pictures = this.protocolData.data.pictures
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

      if (section && pictures) {
        return this.client.sendProtocol(this.currentUser(), section.id, pictures);
      } else {
        this.loader.hideLoading();
        
        this.store.dispatch("showAlert", {
          message: "Невалидна секция и/или снимки",
          type: AlertType.ERROR,
        });
      }
    },
    //
    // Picker methods
    resetElectionRegionFields() {
      this.pickerData.towns = [];
      this.pickerData.cityRegions = [];
      this.pickerData.sections = [];
      this.protocolData.data.municipality = undefined;
      this.protocolData.data.town = undefined;
      this.protocolData.data.cityRegion = undefined;
      this.protocolData.data.section = undefined;
      this.sectionNumber = "";
    },
    didSelectElectionRegion(item: ElectionRegion) {
      this.protocolData.data.electionRegion = item;
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
      this.protocolData.data.town = undefined;
      this.protocolData.data.cityRegion = undefined;
      this.protocolData.data.section = undefined;
      this.sectionNumber = "";
    },
    didSelectMunicipality(item: Municipality) {
      this.protocolData.data.municipality = item;
      // reset dependent fields
      this.resetMunicipalityFields();
      this.getTowns();
    },
    resetTownFields() {
      this.pickerData.cityRegions = [];
      this.pickerData.sections = [];
      this.protocolData.data.cityRegion = undefined;
      this.protocolData.data.section = undefined;
      this.sectionNumber = "";
    },
    didSelectTown(item: Town) {
      this.protocolData.data.town = item;
      // reset dependent fields
      this.resetTownFields();

      if (item.cityRegions && item.cityRegions.length > 0) {
        this.pickerData.cityRegions = item.cityRegions;
        this.electionRegionIsHidden = false;
      } else {
        this.electionRegionIsHidden = true;
        this.protocolData.data.cityRegion = { code: "", name: item.name };
        this.getSections();
      }
    },
    resetCityRegionFields() {
      this.pickerData.sections = [];
      this.protocolData.data.section = undefined;
      this.sectionNumber = "";
    },
    didSelectCityRegion(item: CityRegion) {
      this.protocolData.data.cityRegion = item;
      // reset dependent fields
      this.resetCityRegionFields();
      this.getSections();
    },
    didSelectSection(item: Section) {
      this.protocolData.data.section = item;
      this.sectionNumber = item.id;
    },
    didSelectCountry(item: Country) {
      this.resetData();
      this.protocolData.data.country = item;
      this.getAbroadTowns();
    },
  },
  ionViewWillEnter() {
    this.reloadSelectedPhotos();
  },
});
</script>
