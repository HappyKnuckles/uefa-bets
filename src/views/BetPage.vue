<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Bets</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content v-if="isLoading">
      <ion-spinner></ion-spinner>
    </ion-content>
    <ion-content :fullscreen="true" v-else>
      <h2>Your bets</h2>
      <ion-grid v-for="bet in yourBets" :key="bet.bet?.betTimestamp!">
        <ion-row class="game">
          <ion-col class="ion-text-left">{{ bet.homeTeamName }}</ion-col>
          <ion-col class="ion-text-center">
            {{ bet.bet?.homeTeamGoals }}
            :
            {{ bet.bet?.awayTeamGoals }}
          </ion-col>
          <ion-col class="ion-text-right">{{ bet.awayTeamName }}</ion-col>
        </ion-row>
      </ion-grid>
      <h2>Open bets</h2>
      <ion-grid v-for="game in games" :key="game.gameId">
        <form
          @submit.prevent="() => bet(game.gameId!)"
          v-if="new Date(game.gameStartsAt!) > new Date()"
        >
          <ion-row class="game">
            <ion-col size="4" class="ion-text-left">{{ game.teamHomeName }}</ion-col>

            <ion-col class="input-container">
              <ion-input
                class="ion-text-center"
                placeholder="0"
                v-model="getBetForm(game.gameId!).homeTeamGoals"
              ></ion-input>
              <span>:</span>
              <ion-input
                class="ion-text-center"
                placeholder="0"
                v-model="getBetForm(game.gameId!).awayTeamGoals"
              ></ion-input>
            </ion-col>

            <ion-col size="4" class="ion-text-right">{{ game.teamAwayName }}</ion-col>
          </ion-row>
          <ion-row
            ><ion-button style="margin: 15px auto 0" size="small" type="submit">
              Place Bet</ion-button
            ></ion-row
          >
        </form>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Game, GameBetDto, User } from "@/generated/api";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonRow,
  IonGrid,
  IonCol,
  IonSpinner,
} from "@ionic/vue";
import apiService from "@/services/apiService";
import { onBeforeMount, ref } from "vue";
import { useStore } from "vuex";
const store = useStore()

const games = ref<Game[]>([]);
const yourBets = ref<GameBetDto[]>([]);
const currentUser: User = store.getters.getUser;
const userId: string = currentUser.userId!;
const betForms = ref<{
  [key: number]: { userId: string; homeTeamGoals: string; awayTeamGoals: string };
}>({});
const isLoading = ref(true);

onBeforeMount(async () => {
  try {
    await getBetlessGames();
  } catch (error) {
    console.error("Error fetching games", error);
  }
  try {
    await getBets();
  } catch (error) {
    console.error("failed fetching bets", error);
  }
  isLoading.value = false;
});

async function getBets(){
  const response = await apiService.betApi.apiBetUserBetsGet(userId);
    yourBets.value = response.data;
}

async function getBetlessGames() {
  const response = await apiService.gameApi.apiGameGamesWithoutBetsGet(userId);
  games.value = response.data;
  games.value.forEach((game) => {
    betForms.value[game.gameId!] = {
      userId: userId,
      homeTeamGoals: "",
      awayTeamGoals: "",
    };
  });
}

function getBetForm(gameId: number) {
  return betForms.value[gameId];
}

async function bet(gameId: number) {
  try {
    const betForm = betForms.value[gameId];
    apiService.betApi.apiBetPlaceBetPost(
      parseInt(betForm.homeTeamGoals),
      parseInt(betForm.awayTeamGoals),
      gameId,
      betForm.userId
    );
    await getBetlessGames();
    await getBets();
  } catch (error) {
    console.error(error);
  }
}
</script>
<style scoped>
ion-input {
  min-height: 0 !important;
}
ion-grid {
  border-radius: 7px;
  margin: 15px;
  padding: 15px;
  background-color: #141211;
  border: 1px solid #333232;
}
.game {
  font-size: 17px;
}

.input-container {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
  display: flex;
  align-self: center;
}

h2{
  margin-left: 15px;
  font-weight: 600;
}
</style>
