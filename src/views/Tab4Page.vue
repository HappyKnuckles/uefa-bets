<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Leaderboard</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content v-if="isLoading">
      <ion-spinner></ion-spinner>
    </ion-content>
    <ion-content v-else>
      <ion-grid>
        <ion-row class="header">
          <ion-col size="2">
            <ion-input
              label="Pagesize"
              labelPlacement="stacked"
              v-model="pageSize"
            ></ion-input>
          </ion-col>
          <ion-col size="6">
            <ion-searchbar
              v-model="searchQuery"
              @ionChange="performSearch"
            ></ion-searchbar>
          </ion-col>
          <ion-col>
            <ion-select
              v-model="selectedCommunity"
              @ionChange="getCommunityUserRanking(selectedCommunity)"
            >
              <ion-select-option value="">No Community</ion-select-option>
              <ion-select-option
                v-for="community in communities"
                :key="community.communityId"
                :value="community.communityId"
              >
                {{ community.communityName }}
              </ion-select-option>
            </ion-select>
          </ion-col>
        </ion-row>
        <ion-row class="pagination">
          <ion-col class="ion-text-left">
            <ion-button size="small" @click="prevPage" :disabled="currentPage === 1"
              >Previous
            </ion-button>
          </ion-col>
          <ion-col class="ion-text-center">
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
          </ion-col>
          <ion-col class="ion-text-right">
            <ion-button
              size="small"
              @click="nextPage"
              :disabled="currentPage === totalPages"
              >Next
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-grid>
        <ion-row>
          <ion-col size="2">Rank</ion-col>
          <ion-col size="7">Name</ion-col>
          <ion-col>Points</ion-col>
        </ion-row>
        <ion-row v-for="user in pagedLeaderboard" :key="user.name!">
          <ion-col size="2">{{ user.rank }}.</ion-col>
          <ion-col size="7">
            {{ user.name }}
            <span v-if="user.name === currentUser.username">(you)</span>
            <ion-button v-if="user.name != currentUser.username && selectedCommunity != ''" class="pinbtn" @click="togglePin(user, selectedCommunity)">
              <ion-icon slot="icon-only" :icon="isPinned(user, selectedCommunity) ? heart : heartOutline"></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col>{{ user.points }}</ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Community, User, UserDto } from "@/generated";
import {
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSearchbar,
  IonIcon,
} from "@ionic/vue";
import apiService from "@/services/apiService";
import { ref, onBeforeMount, computed } from "vue";
import { heart, heartOutline } from "ionicons/icons";

const selectedCommunity = ref("");
const currentUser: User = JSON.parse(sessionStorage.getItem("currentuser")!);
let communities: Community[] = [];
const leaderboard = ref();
const isLoading = ref(true);
const pageSize = ref(10);
const currentPage = ref(1);
const searchQuery = ref("");
const pinnedUsers = ref(JSON.parse(localStorage.getItem('pinnedUsers') || '[]'));

onBeforeMount(async () => {
  try {
    const response = await apiService.communityApi.apiCommunityGet();
    communities = response.data;
    await getCommunityUserRanking(null);
  } catch (error) {
    console.log(error);
  }
  isLoading.value = false;
});

const togglePin = (user: UserDto, communityName: string) => {
  const pinIndex = pinnedUsers.value.findIndex((pin: { user: string | null | undefined; currentUser: any; community: string | null | undefined; }) => pin.user === user.name && pin.currentUser === currentUser.username && pin.community === communityName);
  
  if (pinIndex > -1) {
    pinnedUsers.value.splice(pinIndex, 1);
  } else {
    pinnedUsers.value.push({ user: user.name, currentUser: currentUser.username, community: communityName });
  }
  
  localStorage.setItem('pinnedUsers', JSON.stringify(pinnedUsers.value));
};

const isPinned = (user: UserDto, communityName: string) => {
  return pinnedUsers.value.some((pin: { user: string | null | undefined; currentUser: any; community: string | null | undefined; }) => pin.user === user.name && pin.currentUser === currentUser.username && pin.community === communityName);
};

const getCommunityUserRanking = async (communityId: string | null) => {
  try {
    const response = await apiService.communityApi.apiCommunityRankingGet(communityId!);
    leaderboard.value = response.data.members!.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  } catch (error) {
    console.log(error);
  }
};

const performSearch = () => {
  currentPage.value = 1;
};

const totalPages = computed(() => Math.ceil(leaderboard.value.length / pageSize.value));

const pagedLeaderboard = computed(() => {
  let filteredLeaderboard = leaderboard.value;
  if (searchQuery.value) {
    filteredLeaderboard = filteredLeaderboard.filter((user: { name: any }) =>
      user.name!.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredLeaderboard.slice(startIndex, endIndex);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};
</script>
<style scoped>
.header {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 0px 15px;

  ion-select {
    display: inherit;
    justify-content: flex-end;
  }
}
.pinbtn {
  --background: none;
  color: white;
  font-size: 14px;

}
.pagination {
  display: flex;
  align-items: center;
}
</style>
