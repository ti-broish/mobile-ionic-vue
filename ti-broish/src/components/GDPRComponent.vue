<template>
  <!-- keep data -->
  <div class="gdpr">
    <ion-checkbox
      class="ionCheckbox"
      v-model="hasAgreedToKeepData"
      checked="hasAgreedToKeepData"
      @ionChange="didChangeValue($event.target.checked)"
    ></ion-checkbox>
    &nbsp;
    <ion-label
      >Съгласен съм да съхранявате данните ми и за целите на застъпнически кампании за
      следващите избори (след 04.04.2021).</ion-label
    >
  </div>
  <div class="gdpr">
    <ion-label id="gdprDescription">
      Данните ви се съхраняват по подразбиране до 30 дни след изборния ден на база на
      легитимния интерес на администратора и изискванията на Изборния кодекс.
    </ion-label>
  </div>
</template>

<script lang="ts">
import { IonCheckbox, IonLabel } from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "GdprComponent",
  props: {
    pHasAgreedToKeepData: Boolean,
  },
  emits: {
    "has-agreed-to-keep-data": null,
  },
  components: {
    IonCheckbox,
    IonLabel,
  },
  data() {
    return {
      hasAgreedToKeepData: this.pHasAgreedToKeepData ?? false,
    };
  },
  methods: {
    updateCheckbox() {
      this.hasAgreedToKeepData = this.pHasAgreedToKeepData;
    },
    didChangeValue(value: boolean) {
      this.hasAgreedToKeepData = value;

      this.$emit("has-agreed-to-keep-data", this.hasAgreedToKeepData);
    },
  },
  watch: {
    pHasAgreedToKeepData: "updateCheckbox",
  },
});
</script>

<style scoped>
.gdpr {
  margin: auto;
  padding: 4px;
}

#gdprDescription {
  font-size: 14px;
}

.ionCheckbox {
  top: 4px !important;
}

.ios .ionCheckbox {
  top: 8px !important;
}
</style>
