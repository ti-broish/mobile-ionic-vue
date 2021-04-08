<template>
  <div class="container">
    <ion-label>Секция в:</ion-label>

    <div class="checkboxContainer">
      <ion-label>
        <ion-checkbox
          class="ionCheckbox"
          v-model="countryIsNotAbroad"
          checked="countryIsNotAbroad"
          @update:modelValue="
            countryIsNotAbroad = $event;
            countryIsAbroad = !$event;
          "
          :modelValue="countryIsNotAbroad"
        ></ion-checkbox>
        България
      </ion-label>
      <ion-label>
        <ion-checkbox
          class="ionCheckbox"
          v-model="countryIsAbroad"
          checked="countryIsAbroad"
          @update:modelValue="
            countryIsAbroad = $event;
            countryIsNotAbroad = !$event;
          "
          :modelValue="countryIsAbroad"
        ></ion-checkbox>
        Чужбина
      </ion-label>
    </div>
  </div>
</template>

<script lang="ts">
import { IonLabel, IonCheckbox } from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "CountryComponent",
  emits: {
    "did-change-country": null,
  },
  components: {
    IonLabel,
    IonCheckbox,
  },
  data() {
    return {
      countryIsNotAbroad: true,
      countryIsAbroad: false,
    };
  },
  watch: {
    countryIsNotAbroad: "emitDidChangeCountry"
  },
  methods: {
    emitDidChangeCountry() {
      this.$emit("did-change-country", this.countryIsNotAbroad);
    }
  },
});
</script>

<style scoped>
.container, .checkboxContainer {
  margin: auto;
  padding: 8px;
}

.ionCheckbox {
  --background-checked: var(--tib-color-primary);
  --border-color: var(--tib-color-primary);
  --border-color-checked: var(--tib-color-primary);
  --border-radius: 16px;
  --size: 24px;
}

ion-checkbox,
ion-label {
  vertical-align: middle;
}

ion-checkbox {
  margin-right: .25rem;
}

ion-label {
  margin-right: .5rem;
}

</style>
