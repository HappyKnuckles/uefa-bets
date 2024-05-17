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
      <ion-grid v-for="community in communityWithMembers" :key="community.communityId" class="communityGrid">
        <ion-grid class="headerGrid">            
          <router-link :to="`/tabs/leaderboard`" @click="setCommunityId(community.communityId)">
            <ion-row class="headerRow">
                {{ community.communityName }}
            </ion-row>
          </router-link>
          <ion-row class="nameRow">
            <ion-col size="2" class="ion-text-center">Rank</ion-col>
            <ion-col size="7">Name</ion-col>
            <ion-col>Points</ion-col>
          </ion-row>
        </ion-grid>
        <ion-row v-for="user in community.communityId != null
          ? displayUsers[community.communityId]
          : []" :key="user.name!" class="userRow">
          <ion-col v-if="user.rank === 1" class="golden ion-text-center" size="2"
            >{{ user.rank }}.
          </ion-col>
          <ion-col v-else-if="user.rank === 2" class="silver ion-text-center" size="2"
            >{{ user.rank }}.
          </ion-col>
          <ion-col v-else-if="user.rank === 3" class="bronze ion-text-center" size="2"
            >{{ user.rank }}.
          </ion-col>
          <ion-col v-else class="ion-text-center" size="2">{{ user.rank }}.</ion-col>
          <ion-col size="7" v-if="user.name === currentUser.username" class="red">
            {{ user.name }}
          </ion-col>
          <ion-col v-else size="7">
            <ion-icon v-if="user.communityId" :icon="heart" style="vertical-align: top;"></ion-icon>
            {{ user.name }}
          </ion-col>
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
  IonIcon,
} from "@ionic/vue";
import { User, Game, CommunityMembersDto, UserDto } from "@/generated/api";
import { useStore } from "vuex";
import { heart } from "ionicons/icons";
const store = useStore();

const games = ref<Game[]>([]);
const currentUser: User = store.getters.getUser;
const displayUsers: { [key: string]: ExtendedUserDto[] } = {};
const communityWithMembers = ref<CommunityMembersDto[]>([]);
const isLoading = ref(true);
const pinnedUsers = ref(
  JSON.parse(localStorage.getItem(`pinnedUsers_${currentUser.username}`) || "[]")
);
const addValue = ref(!store.getters.getAddValue);
interface ExtendedUserDto extends UserDto{
  rank: number | null | undefined;
  communityId: any;
}

store.watch(
  (state) => ({
    message: state.message,
    add: state.add
  }),
  async ({ message, add }) => {
    if (message.includes("getGames")) {
      await getGames();
      await getUserCommunities();
    }
    if(add === addValue.value){
      addValue.value = !addValue.value;
      pinnedUsers.value = JSON.parse(localStorage.getItem(`pinnedUsers_${currentUser.username}`) || "[]");
      await getUserCommunities();
      await sortDisplayUsers();}
    }
);

onBeforeMount(async () => {
  try {
    await getUserCommunities();
  } catch (error) {
    console.error("Error fetching Usercommunities", error);
  }
  try {
    await getGames();
  } catch (error) {
    console.error("Error fetching games", error);
  }
  await sortDisplayUsers();
  isLoading.value = false;
});

function setCommunityId(id: any){
  store.commit('setCommunityId', id);
}

async function sortDisplayUsers() {
  for (const community of communityWithMembers.value) {
    if (community.communityId != null) {
      displayUsers[community.communityId] = await getDisplayUsers(community);
    }
  }
}

async function getUserCommunities() {
  if (!store.getters.getLoadingUserCommunities) {
    await store.dispatch('fetchUserCommunities');
  }
  communityWithMembers.value = store.getters.getUserCommunities;
}


async function getGames() {
  if (!store.getters.getLoadingGames) {
    await store.dispatch('fetchGames');
  }
  games.value = store.getters.getGames;
  const now = new Date();
  games.value = games.value.filter((game) => {
    const gameStartsAt = new Date(Date.parse(game.gameStartsAt!));
    const diff = (gameStartsAt!.getTime() - now.getTime()) / (1000 * 60);
    return Math.abs(diff) <= 90;
  });
}

async function getDisplayUsers(community: CommunityMembersDto) {
  const sortedMembers: ExtendedUserDto[] = community.members!.map(user => user as ExtendedUserDto);

  if (sortedMembers.length >= 7) {
    displayUsers.value = sortedMembers.slice(0, 3);

    const currentUserIndex = sortedMembers.findIndex(
      (member) => member.name === currentUser.username
    );

    const isCurrentUserInTopThree = displayUsers.value.some(
      (member) => member.name === currentUser.username
    );

    const isCurrentUserLast = currentUserIndex === sortedMembers.length - 1;
    const isCurrentUserFourth = currentUserIndex === 3;
    const isCurrentUserSecondLast = currentUserIndex === sortedMembers.length - 2;

    switch (true) {
      case isCurrentUserInTopThree:
      case isCurrentUserFourth:
        displayUsers.value.push(...sortedMembers.slice(3, 6));
        break;
      case isCurrentUserSecondLast:
        displayUsers.value.push(
          ...sortedMembers.slice(currentUserIndex - 2, currentUserIndex + 1)
        );
        break;
      case isCurrentUserLast:
        displayUsers.value.push(...sortedMembers.slice(currentUserIndex - 3, currentUserIndex));
        break;
      default:
        displayUsers.value.push(
          ...sortedMembers.slice(currentUserIndex - 1, currentUserIndex + 2)
        );
        break;
    }
    displayUsers.value.push(sortedMembers[sortedMembers.length - 1]);
  } else {
    displayUsers.value = sortedMembers;
  }

  pinnedUsers.value = pinnedUsers.value.sort((a: { points: number; registrationDate: string | number | Date; }, b: { points: number; registrationDate: string | number | Date; }) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
  });

  for (const user of pinnedUsers.value) {
    if (user.communityId === community.communityId) {
      if (!displayUsers.value.includes(user)) {
        displayUsers.value.push(user);
      }
    }
  }
  // eventuell vor pinnedusers da diese mit rang gespeichert werden
  let prevValue = 0;
  let currentRank = 1;
  const pointsToRank = new Map();

  sortedMembers.map((member, index) => {
    if (!pointsToRank.has(member.points)) {
      if (member.points !== prevValue) {
        currentRank = index + 1;
        prevValue = member.points!;
      }
      pointsToRank.set(member.points, currentRank);
    }
  });

  displayUsers.value = displayUsers.value.map(user => {
    return {
      ...user,
      rank: pointsToRank.get(user.points)
    };
  });

  const uniqueDisplayUsers = [...new Set(displayUsers.value)];
  return uniqueDisplayUsers;
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

.userRow {}

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
