<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" href="/tabs/dashboard">
          <ion-icon aria-hidden="true" :icon="clipboardOutline" />
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="bets" href="/tabs/bets">
          <ion-icon aria-hidden="true" :icon="cashOutline" />
          <ion-label>Bets</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="communities" href="/tabs/communities">
          <ion-icon aria-hidden="true" :icon="peopleOutline" />
          <ion-label>Communities</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="leaderboard" href="/tabs/leaderboard">
          <ion-icon aria-hidden="true" :icon="statsChartOutline" />
          <ion-label>Leaderboards</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="admin" href="/tabs/admin" v-if="currentUser.username.toLowerCase() === 'nico'">
          <ion-icon aria-hidden="true" :icon="constructOutline" />
          <ion-label>Admin</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { cashOutline, clipboardOutline, constructOutline, peopleOutline, statsChartOutline } from 'ionicons/icons';
import { useStore } from 'vuex';
const store = useStore();
const currentUser = store.getters.getUser;


</script>
