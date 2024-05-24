<template>
  <ion-row class="game">
    <ion-badge v-if="badgeText === 'LIVE'" class="badge-live">{{ badgeText }}</ion-badge>
    <span v-else :class="['time', { past }]">{{ badgeText }}</span>
    <ion-col class="ion-text-left">{{ game.teamHomeName }}</ion-col>
    <ion-col class="ion-text-center">
      {{ game.teamHomeGoals }} : {{ game.teamAwayGoals }}
    </ion-col>
    <ion-col class="ion-text-right">{{ game.teamAwayName }}</ion-col>
  </ion-row>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Game } from "../generated/api";
import { IonRow, IonCol, IonBadge } from "@ionic/vue";

const props = defineProps<{
  game: Game;
  past: boolean;
}>();

const getBadgeText = (game: Game): string => {
  const now = new Date();
  const gameStart = new Date(game.gameStartsAt!);
  const diffInMinutes = Math.floor((gameStart.getTime() - now.getTime()) / 60000);

  if (diffInMinutes > 90) {
    return "";
  } else if (diffInMinutes > 0) {
    return transformDate(game.gameStartsAt!);
  } else if (diffInMinutes >= -90) {
    return "LIVE";
  } else {
    return transformDate(game.gameStartsAt!);
  }
};

const badgeText = computed(() => getBadgeText(props.game));
function transformDate(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return day + "." + month + " " + hours + ":" + minutes;
}
</script>

<style scoped>
.badge-live{
    display: flex;
    align-items: center;
}
.time {
  max-width: 10%;
  font-size: 13px;
  text-align: center;
}
.time.past {
  color: gray;
}
</style>
