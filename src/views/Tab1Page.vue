<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div>
        <ul>
          <li v-for="user in users" :key="user.userId">{{ user.username }}</li>
        </ul>
        <ul>
          <li v-for="game in games" :key="game.gameId">{{game.teamHomeName}} {{game.teamHomeGoals}} : {{game.teamAwayGoals}} {{game.teamAwayName}}  </li>
        </ul>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'; 
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import apiService from '@/services/apiService'; 
import { User, Game } from '@/generated/api';

let users: User[] = [];
let games: Game[] = [];



onMounted(async () => {
  try {
    const response = await apiService.userApi.apiUserGet();
    const data = response.data;
    users = data;
  } catch (error) {
    console.error('Error fetching community data:', error);
  }
  try {
    const response = await apiService.gameApi.apiGameGet();
    const data = response.data;
    games = data;
    const now = new Date();
    games = games.filter(game =>{
      const gameStartsAt = new Date(Date.parse(game.gameStartsAt!));  
      const diff = (gameStartsAt!.getTime() - now.getTime()) / (1000 * 60);   
      return Math.abs(diff) <= 90; 
    })
  } catch (error){
    console.error('Error fetchign games', error);
  }
});
</script>



<style scoped>
</style>
