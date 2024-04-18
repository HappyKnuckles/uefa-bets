<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Place Bets</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ul>
        <li v-for="game in games" :key="game.gameId">
          <form @submit.prevent="() => bet(game.gameId!)">
            {{ game.teamHomeName }}
            <ion-input placeholder="0" v-model="getBetForm(game.gameId!).homeTeamGoals"></ion-input>
            :
            <ion-input placeholder="0" v-model="getBetForm(game.gameId!).awayTeamGoals"></ion-input>
            {{ game.teamAwayName }}
            <ion-button type="submit"> Place Bet</ion-button>
          </form>
        </li>
      </ul>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Game, User } from '@/generated/api';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton } from '@ionic/vue';
import apiService from "@/services/apiService";
import { onBeforeMount, ref } from 'vue';

let games: Game[] = [];
const currentUser: User = JSON.parse(sessionStorage.getItem("currentuser")!);
const userId: string = currentUser.userId!;
const betForms = ref<{ [key: number]: { userId: string; homeTeamGoals: string; awayTeamGoals: string } }>({});

onBeforeMount(async () => {
  try {
    const response = await apiService.gameApi.apiGameGet();
    games = response.data;
    // Initialize betForms for each game
    games.forEach(game => {
      betForms.value[game.gameId!] = { userId: userId, homeTeamGoals: "", awayTeamGoals: "" };
    });
  } catch (error) {
    console.error("Error fetching games", error);
  }
})

function getBetForm(gameId: number) {
  return betForms.value[gameId];
}

function bet(gameId: number) {
  try {
    const betForm = betForms.value[gameId];
    apiService.betApi.apiBetPlaceBetPost(parseInt(betForm.homeTeamGoals), parseInt(betForm.awayTeamGoals), gameId, betForm.userId);
  } catch (error) {
    console.log(error);
  }
}
</script>
