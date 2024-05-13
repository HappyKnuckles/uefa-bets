<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Admin Page</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content v-if="isLoading">
      <ion-spinner></ion-spinner>
    </ion-content>

    <ion-content v-else>
      <ion-grid v-for="game in games" :key="game.gameId" class="gameGrid">
        <ion-row class="game">
          <ion-col class="ion-text-left" @click="setGoal(false, game.gameId!)">
            {{ game.teamHomeName }}
            <ion-icon :icon="add"></ion-icon>
          </ion-col>
          <ion-col class="ion-text-center">
            {{ game.teamHomeGoals }}
            :
            {{ game.teamAwayGoals }}
          </ion-col>
          <ion-col class="ion-text-right" @click="setGoal(true, game.gameId!)">
            <ion-icon :icon="add"></ion-icon>
            {{ game.teamAwayName }}
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Game } from "@/generated";
import apiService from "@/services/apiService";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonPage,
  IonContent,
  IonGrid,
  IonCol,
  IonRow,
  IonSpinner,
  IonIcon,
} from "@ionic/vue";
import { add } from "ionicons/icons";
import { onBeforeMount, ref } from "vue";
import { useStore } from "vuex";

const games = ref<Game[]>([]);
const store = useStore();
const isLoading = ref(true);

onBeforeMount(async () => {
  await getGames();
  isLoading.value = false;
});

async function getGames() {
  await store.dispatch("fetchGames");
  games.value = store.getters.getGames;
}

async function setGoal(awayTeam: boolean, gameId: number) {
  await apiService.gameApi.apiGameGoalPost(awayTeam, gameId);
  await getGames();
}

</script>
<style scoped>
.gameGrid {
  margin: 15px;
  background-color: #141211;
  border: 1px solid #333232;
  border-radius: 7px;
  font-size: 17px;
}
ion-icon {
  font-size: 17px;
  vertical-align: top;
}
</style>
