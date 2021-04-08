<template>
  <div class="pscContainer">
    <div class="pscLabelContainer" v-show="hideTitle">
      <ion-label
        >{{ pTitle }} <span v-show="pRequired" class="required">*</span></ion-label
      >
    </div>
    <div class="pscSelectContainer">
      <ion-select
        class="ionSelect"
        interface="action-sheet"
        cancel-text="Затвори"
        placeholder="Избери"
        :selected-text="getSelectedText()"
        :value="getSelectedValue()"
        :disabled="pickerData.length == 0"
        @ionChange="didSelectItem($event.target.value)"
      >
        <div
          v-if="
            pickerType === 'phone' ||
            pickerType === 'electionRegion' ||
            pickerType === 'section'
          "
        >
          <ion-select-option
            v-for="item in pickerData"
            :value="item.code"
            :key="'item-' + item.id"
          >
            {{ item.code + " " + item.name }}
          </ion-select-option>
        </div>
        <div v-else-if="pickerType === 'town' || pickerType === 'cityRegion'">
          <ion-select-option
            v-for="item in pickerData"
            :value="item.code"
            :key="'item-' + item.id"
          >
            {{ item.name }}
          </ion-select-option>
        </div>
        <div v-else-if="pickerType === 'parties'">
          <ion-select-option
            v-for="item in pickerData"
            :value="item.id ?? item.code"
            :key="'item-' + item.id"
          >
            <span v-if="item.id > 0">
              {{ item.id + ". " + item.name }}
            </span>
            <span v-else>
              {{ item.name }}
            </span>
          </ion-select-option>
        </div>
        <div v-else>
          <ion-select-option
            v-for="item in pickerData"
            :value="item.id ?? item.code"
            :key="'item-' + item.id"
          >
            {{ item.name }}
          </ion-select-option>
        </div>
      </ion-select>
    </div>
  </div>
</template>

<script>
import { IonLabel, IonSelect, IonSelectOption } from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "PickerSelectComponent",
  props: {
    pTitle: String,
    pData: Array,
    pSelectedItem: Object,
    pRequired: Boolean,
    pPickerType: String,
  },
  emits: {
    "select-picker-item": null,
  },
  components: {
    IonLabel,
    IonSelect,
    IonSelectOption,
  },
  data() {
    return {
      pickerData: this.pData ?? [],
      pickerType: this.pPickerType ?? "",
      selectedItem: this.pSelectedItem ?? null,
      hideTitle: this.pTitle?.length > 0 ?? false,
    };
  },
  methods: {
    useCodeKey() {
      return (
        this.pickerType === "phone" ||
        this.pickerType === "electionRegion" ||
        this.pickerType === "section" ||
        this.pickerType === "municipality" ||
        this.pickerType === "town" ||
        this.pickerType === "country" ||
        this.pickerType === "cityRegion"
      );
    },
    reloadPickerData() {
      if (this.pData) {
        this.pickerData = this.pData;

        if (this.pRequired && this.pickerData.length === 1) {
          const itemId = this.useCodeKey()
            ? this.pickerData[0].code
            : this.pickerData[0].id;

          this.didSelectItem(itemId);
        } else {
          this.selectedItem = this.pSelectedItem ?? null;
        }
      }
    },
    getSelectedValue() {
      if (this.selectedItem) {
        return this.useCodeKey() ? this.selectedItem.code : this.selectedItem.id;
      } else {
        return "";
      }
    },
    getSelectedText() {
      if (this.selectedItem) {
        if (this.pickerType === "phone" || this.pickerType === "section") {
          return this.selectedItem.code;
        } else if (this.pickerType === "parties") {
          const name = this.selectedItem.displayName ?? this.selectedItem.name;

          if (this.selectedItem.id > 0) {
            return this.selectedItem.id + ". " + name;
          } else {
            return name;
          }
        } else {
          return this.selectedItem.displayName ?? this.selectedItem.name;
        }
      } else {
        return "";
      }
    },
    didSelectItem(itemId) {
      let index = -1;

      if (this.useCodeKey()) {
        index = this.pickerData.findIndex(function (el) {
          return el.code === itemId;
        });
      } else {
        index = this.pickerData.findIndex(function (el) {
          return el.id === itemId;
        });
      }

      if (index > -1) {
        this.selectedItem = this.pickerData[index];

        this.$emit("select-picker-item", this.selectedItem);
      }
    },
  },
  watch: {
    pData: "reloadPickerData",
    pSelectedItem: "reloadPickerData",
  },
});
</script>

<style scoped>
.pscContainer {
  margin: auto;
}

.pscLabelContainer {
  padding: 8px;
}

.pscSelectContainer {
  margin-left: 8px;
  margin-right: 8px;

  background-color: white;
}

.ionSelect {
  width: 100%;
  max-width: 100% !important;
}
</style>
