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
      <ion-grid v-for="game in games" :key="game.gameId" class="gameGrid">
        <ion-row class="game">
          <ion-badge>LIVE</ion-badge>
          <ion-col class="ion-text-left">{{ game.teamHomeName }}</ion-col>
          <ion-col class="ion-text-center">
            {{ game.teamHomeGoals }}
            :
            {{ game.teamAwayGoals }}
          </ion-col>
          <ion-col class="ion-text-right">{{ game.teamAwayName }}</ion-col>
        </ion-row>
      </ion-grid>
      <ion-grid
        v-for="community in communityWithMembers"
        :key="community.communityId"
        class="communityGrid"
      >
        <ion-grid class="headerGrid">
          <ion-row class="headerRow">{{ community.communityName }}</ion-row>
          <ion-row class="nameRow">
            <ion-col size="2" class="ion-text-center">Rank</ion-col>
            <ion-col size="7">Name</ion-col>
            <ion-col>Points</ion-col>
          </ion-row>
        </ion-grid>
        <ion-row
          v-for="(user, index) in community.communityId != null
            ? displayUsers[community.communityId]
            : []"
          :key="user.name!"
          class="userRow"
        >
          <!-- <ion-col v-if="user.rank === 1" class="golden" size="1"
            >{{ user.rank }}.
          </ion-col>
          <ion-col v-else-if="user.rank === 2" class="silver" size="1"
            >{{ user.rank }}.
          </ion-col>
          <ion-col v-else-if="user.rank === 3" class="bronze" size="1"
            >{{ user.rank }}.
          </ion-col> -->
          <ion-col size="2" class="ion-text-center">{{ index + 1 }}.</ion-col>
          <ion-col size="7" v-if="user.name === currentUser.username" class="red">
            {{ user.name }}
          </ion-col>
          <ion-col v-else size="7">{{ user.name }}</ion-col>
          <ion-col>{{ user.points }}</ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
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
  IonGrid,
  IonBadge,
  IonRow,
  IonCol,
} from "@ionic/vue";
import apiService from "@/services/apiService";
import { User, Game, CommunityMembersDto, UserDto } from "@/generated/api";
const socket = new WebSocket("wss://localhost:44320/allHub");

const games = ref<Game[]>([]);
const currentUser: User = JSON.parse(sessionStorage.getItem("currentuser")!);
const displayUsers: { [key: string]: UserDto[] } = {};
const communityWithMembers = ref<CommunityMembersDto[]>([]);
const isLoading = ref(true);
const pinnedUsers = ref(
  JSON.parse(localStorage.getItem(`pinnedUsers_${currentUser.username}`) || "[]")
);

socket.onopen = () => {
  console.log("WebSocket connection opened");
  const endChar = String.fromCharCode(30);

  socket.send(`{"protocol":"json","version":1}${endChar}`);
};

socket.onmessage = async (event) => {
  console.log("Received message from WebSocket:", event.data);
  console.log(event)
  if (event.data === "{\"type\":1,\"target\":\"getGames\",\"arguments\":[]}\u001e") {
    await getGames();
    await getUserCommunities();
  }
};

socket.onclose = () => {
  console.log("WebSocket connection closed");
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

onBeforeMount(async () => {
  try {
    await getUserCommunities();
  } catch (error) {
    console.error(!"Error fetching Usercommunities", error);
  }
  try {
    await getGames();
  } catch (error) {
    console.error("Error fetchign games", error);
  }
  for (const community of communityWithMembers.value) {
    if (community.communityId != null) {
      displayUsers[community.communityId] = await getDisplayUsers(community);
    }
  }

  isLoading.value = false;
});

async function getUserCommunities() {
  const response = await apiService.userCommunityApi.apiUserCommunityShowUserCommunitiesGet(
    currentUser.userId
  );
  communityWithMembers.value = response.data;
}

async function getGames() {
  const response = await apiService.gameApi.apiGameGet();
  const data = response.data;
  games.value = data;
  const now = new Date();
  games.value = games.value.filter((game) => {
    const gameStartsAt = new Date(Date.parse(game.gameStartsAt!));
    const diff = (gameStartsAt!.getTime() - now.getTime()) / (1000 * 60);
    return Math.abs(diff) <= 90;
  });
}

async function getDisplayUsers(community: CommunityMembersDto) {
  const sortedMembers = community.members!;
  let topUsers = sortedMembers.slice(0, 3);

  const lastUser = sortedMembers.slice(-1)[0];
  topUsers.push(lastUser!);

  while (topUsers.length < 7 && sortedMembers.length > 0) {
    const user = sortedMembers.shift();
    if (!topUsers.includes(user!)) {
      topUsers.push(user!);
    }
  }

  if (pinnedUsers.value.currentUserName === currentUser.username) {
    for (const user of pinnedUsers.value) {
      if (!topUsers.includes(user)) {
        topUsers.push(user);
      }
    }
  }
  topUsers = [...new Set(topUsers)];
  return topUsers;
}
</script>

<style scoped>
.communityGrid,
.gameGrid {
  margin: 15px;
  background-color: #141211;
  border: 1px solid #333232;
  border-radius: 7px;
}
.headerGrid {
  background-color: #272727;
  border-radius: 7px;
  margin-bottom: 5px;

  .headerRow {
    padding: 10px 10px 5px;
    margin-bottom: 5px;
    font-size: 17px;
    font-weight: 600;
  }

  .nameRow {
    font-size: 14px;
  }
}
.userRow {
}
.game {
  font-size: 17px;
}
.golden {
  color: gold;
}

.silver {
  color: silver;
}

.bronze {
  color: #cd7f32;
}
.red {
  color: var(--ion-color-primary);
}
</style>
