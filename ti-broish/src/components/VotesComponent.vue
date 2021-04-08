<template>
  <div class="votesInputContainer">
    <ion-input
      type="number"
      value="number"
      inputmode="numeric"
      v-model="votes"
      @ionChange="setVotes($event.target.value)"
      @keyup.enter="hideKeyboard($event.target)"
    >
    </ion-input>
  </div>
</template>

<script lang="ts">
import { IonInput } from "@ionic/vue";
import { defineComponent } from "vue";
import { Plugins } from "@capacitor/core";

export default defineComponent({
  name: "VotesComponent",
  props: {
    pVotes: Number,
  },
  emits: {
    "set-votes": null,
  },
  components: {
    IonInput,
  },
  data() {
    return {
      votes: this.pVotes ?? undefined,
    };
  },
  methods: {
    hideKeyboard(sender: HTMLIonInputElement) {
      sender?.blur();

      const { Keyboard } = Plugins;
      Keyboard.hide();
    },
    reloadVotes() {
      this.votes = this.pVotes ?? undefined;
    },
    setVotes(votes: number) {
      this.$emit("set-votes", votes);
    },
  },
  watch: {
    pVotes: "reloadVotes",
  },
});
</script>

<style scoped>
.votesInputContainer {
  background-color: white;
}
</style>
