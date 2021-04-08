<template>
  <div class="pvcContainer">
    <picker-select-component
      class="pickerSelectComponent"
      :pData="pickerData"
      :pSelectedItem="partyVotes.party"
      @select-picker-item="didSelectParty($event)"
    >
    </picker-select-component>
    <votes-component
      class="votesComponent"
      v-show="showVotesInput"
      :pVotes="partyVotes.votes"
      @set-votes="didSetVotes($event)"
    ></votes-component>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Party, PartyVotes } from "@/store/modules/parties/types";
import PickerSelectComponent from "@/components/PickerSelectComponent.vue";
import VotesComponent from "@/components/VotesComponent.vue";

export default defineComponent({
  name: "PartyVotesComponent",
  props: {
    pTitle: String,
    pData: Array,
    pPartyVotes: Object,
  },
  emits: {
    "select-party": null,
    "set-votes": null,
  },
  components: {
    PickerSelectComponent,
    VotesComponent,
  },
  data() {
    return {
      pickerData: (this.pData as Array<Party>) ?? ([] as Array<Party>),
      showVotesInput: false,
      partyVotes: (this.pPartyVotes as PartyVotes) ?? ({} as PartyVotes),
    };
  },
  mounted() {
    if (this.partyVotes.party) {
      this.showVotesInput = this.pPartyVotes?.party.id === this.partyVotes.party.id;
    }
  },
  methods: {
    reloadPickerData() {
      if (this.pData) {
        this.pickerData = this.pData as Array<Party>;
      }
    },
    reloadPartyVotes() {
      if (this.pPartyVotes?.party) {
        this.partyVotes = (this.pPartyVotes as PartyVotes) ?? ({} as PartyVotes);
      } else {
        this.partyVotes = {} as PartyVotes;
      }

      this.showVotesInput = this.partyVotes?.party != null;
    },
    didSelectParty(party: Party) {
      const index = this.pickerData.findIndex(function (el) {
        return el.id === party.id;
      });

      if (index > -1) {
        this.showVotesInput = true;
        this.partyVotes.index = index;
        this.partyVotes.party = party;

        this.$emit("select-party", this.partyVotes);
      }
    },
    didSetVotes(votes: number) {
      const index = this.partyVotes.index ?? -1;

      if (index > -1) {
        this.partyVotes.votes = votes;

        this.$emit("set-votes", this.partyVotes);
      }
    },
  },
  watch: {
    pData: "reloadPickerData",
    pPartyVotes: "reloadPartyVotes",
  },
});
</script>

<style scoped>
.pvcContainer {
  display: flex;
  flex-direction: row;
  height: 40px;
}

.pickerSelectComponent {
  margin-left: 0px;
  width: 80%;
}

.votesComponent {
  width: 20%;
}
</style>
