<template>
  <navigation-toolbar-component
    @navigation-back-button-pressed="dismiss()"
    :pShowCloseButton="true"
  ></navigation-toolbar-component>

  <ion-content scroll-x="true" scroll-y="true">
    <div>
      <img :src="imageUrl" alt="" class="zoomedImage" />
    </div>
  </ion-content>
</template>

<script>
import { IonContent } from "@ionic/vue";
import { defineComponent } from "vue";

import NavigationToolbarComponent from "@/components/NavigationToolbarComponent.vue";

export default defineComponent({
  name: "ImagePreview",
  props: {
    pImageUrl: String,
    pModalController: Object,
  },
  components: { IonContent, NavigationToolbarComponent },
  data() {
    return {
      imageUrl: this.pImageUrl ?? "",
    };
  },
  methods: {
    dismiss() {
      this.pModalController?.dismiss();
    },
  },
});
</script>

<style scoped>
.zoomedImage {
  position: relative;
  top: 0;
  left: 0;
  width: 100vw;
  height: auto;
  z-index: 999;
}
</style>
