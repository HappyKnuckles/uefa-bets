<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div v-if="isLoading">
        Loading...
      </div>
      <div v-else>
        <ul>
          <li v-for="game in games" :key="game.gameId">
            {{ game.teamHomeName }} {{ game.teamHomeGoals }} : {{ game.teamAwayGoals }}
            {{ game.teamAwayName }}
          </li>
        </ul>
        <ul>
          <h2>Leaderboard</h2>
          <li v-for="(user, index) in leaderboard.slice(0, 3)" :key="user.userId">
            {{ index + 1 }}. {{ user.username }} {{ user.points }}
          </li>
          <li v-if="getCurrentUserRank().rankAbove && getCurrentUserRank().rank > 5">
            {{ getCurrentUserRank().rank - 1 }}.
            {{ getCurrentUserRank().rankAbove.username }}
            {{ getCurrentUserRank().rankAbove.points }}
          </li>
          <li v-if="currentUser">
            {{ getCurrentUserRank().rank }}. {{ currentUser.username }}
            {{ currentUser.points }}
          </li>

          <li v-if="getCurrentUserRank().rankBelow && getCurrentUserRank().rank < leaderboard.length - 1">
            {{ getCurrentUserRank().rank + 1 }}.
            {{ getCurrentUserRank().rankBelow.username }}
            {{ getCurrentUserRank().rankBelow.points }}
          </li>

          <li v-if="leaderboard.length > 3" :key="leaderboard.length">
            {{ leaderboard.length }}. {{ leaderboard[leaderboard.length - 1].username }}
            {{ leaderboard[leaderboard.length - 1].points }}
          </li>
        </ul>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/vue";
import apiService from "@/services/apiService";
import { User, Game } from "@/generated/api";

let games: Game[] = [];
let leaderboard: User[] = [];
const currentUserJson = sessionStorage.getItem("currentuser");
let currentUser: User;
const isLoading = ref(true);
onBeforeMount(async () => {
  try {
    const response = await apiService.userApi.apiUserGetLeaderboardGet();
    const data = response.data;
    leaderboard = data;
  } catch (error) {
    console.error("Error fetching community data:", error);
  }
  try {
    const response = await apiService.gameApi.apiGameGet();
    const data = response.data;
    games = data;
    const now = new Date();
    games = games.filter((game) => {
      const gameStartsAt = new Date(Date.parse(game.gameStartsAt!));
      const diff = (gameStartsAt!.getTime() - now.getTime()) / (1000 * 60);
      return Math.abs(diff) <= 90;
    });
  } catch (error) {
    console.error("Error fetchign games", error);
  }
  currentUser = JSON.parse(currentUserJson!);
  isLoading.value = false;
});

function getCurrentUserRank(this: any) {
  const currentUserIndex = this.leaderboard.findIndex(
    (user: { userId: any }) => user.userId === this.currentUser.userId
  );
  const rankAbove = currentUserIndex > 0 ? this.leaderboard[currentUserIndex - 1] : null;
  const rankBelow =
    currentUserIndex < this.leaderboard.length - 1
      ? this.leaderboard[currentUserIndex + 1]
      : null;
  return {
    rank: currentUserIndex + 1,
    rankAbove,
    rankBelow,
  };
}
</script>

<style scoped></style>
