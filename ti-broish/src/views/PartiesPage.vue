<template>
  <ion-page>
    <ion-content>
      <menu-component></menu-component>

      <div class="contentContainer">
        <h4>Брой гласове за:</h4>

        <ion-list class="componentsContainer">
          <ion-item
            lines="none"
            v-for="(party, index) in votes"
            ref="pickerRefs"
            :key="'party-' + party.id"
            class="root-item"
          >
            <div class="sub-item">
              <party-votes-component
                :pData="filteredParties()"
                :pPartyVotes="votes[index]"
                @select-party="didSelectParty($event)"
                @set-votes="didSetPartyVotes($event)"
              ></party-votes-component>
            </div>
            <ion-button
              class="ionCloseButton"
              @click="deleteParty(index)"
              slot="end"
              color="danger"
            >
              <ion-icon icon="close"></ion-icon>
            </ion-button>
          </ion-item>

          <ion-button
            class="actionButton"
            @click="addParty()"
            :disabled="!canAddResults()"
            >Добави резултат</ion-button
          >
        </ion-list>

        <div>
          <ion-button
            class="actionButton"
            @click="sendResults()"
            :disabled="!resultsReady()"
            >Изпрати резултатите</ion-button
          >
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonPage } from "@ionic/vue";
import { defineComponent } from "vue";
import { AlertType, useStore } from "@/store";
import { useRouter } from "vue-router";
import { ApiClient } from "@/services/api.client";
import { Party, PartyVotes } from "@/store/modules/parties/types";
import { mapGetters } from "vuex";
import { ErrorHandler } from "@/services/error-handler";

import MenuComponent from "@/components/MenuComponent.vue";
import PartyVotesComponent from "@/components/PartyVotesComponent.vue";

export default defineComponent({
  name: "PartiesPage",
  components: {
    IonContent,
    IonPage,
    MenuComponent,
    PartyVotesComponent,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const client = new ApiClient();
    const errorHandler = new ErrorHandler();

    return { store, router, client, errorHandler };
  },
  async mounted() {
    // go back if no active protocol
    if (!this.getProtocolData || !this.getProtocolData.id) {
      await this.$router.push("/home/send-protocol");
    }
    await this.getParties();
  },
  data() {
    return {
      pickerData: {
        parties: [] as Array<Party>,
        filteredpParties: [] as Array<Party>,
      },
      votes: [] as Array<PartyVotes>,
    };
  },
  computed: {
    ...mapGetters("protocols", ["getProtocolData"]),
    ...mapGetters("user", ["currentUser"]),
  },
  methods: {
    resetVotes() {
      this.votes = [];
    },
    filteredParties() {
      const partiesIds = this.votes.map((partyVotes) => partyVotes.party?.id);
      const result = this.pickerData.parties.filter(
        (party) => !partiesIds.includes(party.id)
      );

      return result;
    },
    canAddResults() {
      return this.filteredParties().length > 0;
    },
    resultsReady() {
      return (
        this.votes.length > 0 && !this.votes.some((entry) => !entry.party || !entry.votes)
      );
    },
    partyWithId(id: number): Party | null {
      const index = this.pickerData.parties.findIndex(function (el) {
        return el.id === id;
      });

      return index > -1 ? this.pickerData.parties[index] : null;
    },
    preloadParties() {
      const featuredParties = this.pickerData.parties
        .filter((party) => party.isFeatured)
        .sort(function (lhs: Party, rhs: Party) {
          if (lhs.id < rhs.id) {
            return -1;
          }
          if (lhs.id > rhs.id) {
            return 1;
          }
          return 0;
        });

      for (let i = 0; i < featuredParties.length; i++) {
        this.addParty();
        this.didSelectParty({ index: i, party: featuredParties[i], votes: 0 });
      }
    },
    getParties() {
      return this.client
        .getParties(this.currentUser)
        .then((response) => {
          this.pickerData.parties = response;
          this.preloadParties();
        })
        .catch(() => {
          this.store.dispatch("showAlert", {
            message: "Грешка при зареждането на списъка с партии.",
            type: AlertType.ERROR,
          });
        });
    },
    addParty() {
      const index = this.votes.length > 0 ? this.votes.length : 0;

      this.votes.push({ party: null, votes: null, index: index });
    },
    updateVotesIndexes() {
      let index = 0;

      this.votes.forEach(function (partyVotes) {
        partyVotes.index = index++;
      });
    },
    didSelectParty(partyVotes: PartyVotes) {
      const index = this.votes.findIndex(function (el) {
        return el.party?.id === partyVotes.party?.id;
      });

      if (index > -1) {
        this.votes[index].party = partyVotes.party;
      } else {
        this.votes[this.votes.length - 1].party = partyVotes.party;
      }

      this.updateVotesIndexes();
    },
    didSetPartyVotes(partyVotes: PartyVotes) {
      const index = this.votes.findIndex(function (el) {
        return el.party?.id === partyVotes.party?.id;
      });

      if (index > -1) {
        this.votes[index].votes = partyVotes.votes;
      } else {
        this.votes[this.votes.length - 1].votes = partyVotes.votes;
      }

      this.updateVotesIndexes();
    },
    deleteEmptyFields() {
      const index = this.votes.findIndex(function (el) {
        return el.party === null;
      });

      if (index > -1) {
        this.votes.splice(index, 1);
        this.deleteEmptyFields();
      } else {
        this.updateVotesIndexes();
      }
    },
    deleteParty(index: number) {
      this.votes.splice(index, 1);
      this.updateVotesIndexes();
      this.deleteEmptyFields();
    },
    canSendResults() {
      const results = this.votes.filter((result) => {
        return result.party && result.party.id >= 0 && result.votes && result.votes >= 0;
      });

      return results.length === this.votes.length;
    },
    sendResults() {
      if (!this.canSendResults()) {
        this.store.dispatch("showAlert", {
          message: "Моля въведете брои гласове по-голям от нула.",
          type: AlertType.ERROR,
        });

        return;
      }

      if (this.getProtocolData.id) {
        this.client
          .sendResults(this.currentUser, this.getProtocolData.id, this.votes)
          .then(() => {
            this.store.dispatch("showAlert", {
              message: "Резултатите са изпратени успешно.",
              position: "top",
            });

            this.resetVotes();
            this.store.commit("protocols/resetState");
            this.$router.go(-1);
          })
          .catch((err) => {
            const message = this.errorHandler.handleAPIError(err.response.data);
            this.store.dispatch("showAlert", { message, type: AlertType.ERROR });

            // go back to protocol form if already sent
            if (err.response.status === 409) {
              this.resetVotes();
              this.$router.go(-1);
            }
          });
      } else {
        this.store.dispatch("showAlert", {
          message: "Грешка при изпращането на резултатите. Невалиден протокол.",
          type: AlertType.ERROR,
        });
      }
    },
  },
});
</script>

<style scoped>
.componentsContainer {
  margin: 8px;
  flex-direction: row;
}

ion-list {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

ion-item {
  margin-left: 0 !important;
  margin-right: 0 !important;
  margin-bottom: 8px;
}

.root-item {
  --padding-start: 0px !important;
  --padding-end: 0px !important;
  --inner-padding-start: 0px !important;
  --inner-padding-end: 0px !important;
}

.ionCloseButton {
  margin-top: 8px;
}

.sub-item {
  margin-bottom: 0;
}

.sub-item:first-child {
  width: 100% !important;
}

[slot="end"] {
  margin-inline-start: 16px !important;
}
</style>
