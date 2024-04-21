<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content v-if="isLoading">
      <ion-spinner></ion-spinner>
    </ion-content>
    <ion-content v-else>
      <ul>
        <li v-for="game in games" :key="game.gameId">
          {{ game.teamHomeName }} {{ game.teamHomeGoals }} : {{ game.teamAwayGoals }}
          {{ game.teamAwayName }}
        </li>
      </ul>
      <ion-list v-for="community in communityWithMembers" :key="community.communityId">
        <ion-item> {{ community.communityName }} </ion-item>
        <ion-item v-for="(user, index) in (community.communityId != null ? displayUsers[community.communityId] : [])" :key="user.name!">
          {{ index + 1 }}. {{ user.name }} {{ user.points }}
        </ion-item>
      </ion-list>    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonList,
  IonItem,
} from "@ionic/vue";
import apiService from "@/services/apiService";
import { User, Game, CommunityMembersDto, UserDto } from "@/generated/api";

let games: Game[] = [];
const currentUser: User = JSON.parse(sessionStorage.getItem("currentuser")!);
const displayUsers: { [key: string]: UserDto[] } = {};
let communityWithMembers: CommunityMembersDto[] = [];
const isLoading = ref(true);
onBeforeMount(async () => {
  try {
    const response = await apiService.userCommunityApi.apiUserCommunityShowUserCommunitiesGet(
      currentUser.userId
    );
    communityWithMembers = response.data;
    console.log(communityWithMembers);
  } catch (error) {
    console.log(error);
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
  for (const community of communityWithMembers) {
  if (community.communityId != null) {
    displayUsers[community.communityId] = await getDisplayUsers(community);
  }
}

  isLoading.value = false;
});

async function getDisplayUsers(community: CommunityMembersDto) {
  const sortedMembers = community.members!;
  console.log(community.communityName);
  let topUsers = sortedMembers.slice(0, 3);

  const lastUser = sortedMembers.slice(-1)[0];
  topUsers.push(lastUser!);

  while (topUsers.length < 7 && sortedMembers.length > 0) {
    const user = sortedMembers.shift();
    if (!topUsers.includes(user!)) {
      topUsers.push(user!);
    }
  }

  const pinnedUsers = JSON.parse(localStorage.getItem("pinnedUsers")!);
  if (pinnedUsers.currentUser === currentUser.username) {
    for (const user of pinnedUsers) {
      if (!topUsers.includes(user)) {
        topUsers.push(user);
      }
    }
  }
  topUsers = [...new Set(topUsers)];
  return topUsers;
}
</script>

<style scoped></style>
