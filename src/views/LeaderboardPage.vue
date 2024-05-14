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
          <ion-col style="display: grid; justify-content: flex-end">
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
            <ion-button
              class="nav btn"
              size="small"
              @click="prevPage"
              :disabled="currentPage === 1"
              ><ion-icon slot="icon-only" :icon="chevronBack"></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col class="ion-text-center">
            <span> {{ currentPage }} of {{ totalPages }}</span>
          </ion-col>
          <ion-col class="ion-text-right">
            <ion-button
              class="nav btn"
              size="small"
              @click="nextPage"
              :disabled="currentPage === totalPages"
              ><ion-icon slot="icon-only" :icon="chevronForward"></ion-icon>
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-grid class="nameGrid">
        <ion-row class="titleRow">
          <ion-col size="2">Rank</ion-col>
          <ion-col size="7">Name</ion-col>
          <ion-col>Points</ion-col>
        </ion-row>
        <ion-row v-for="user in pagedLeaderboard" :key="user.name!" class="userRow">
          <ion-col v-if="user.rank === 1" class="golden" size="2"
            >{{ user.rank }}.
          </ion-col>
          <ion-col v-else-if="user.rank === 2" class="silver" size="2"
            >{{ user.rank }}.
          </ion-col>
          <ion-col v-else-if="user.rank === 3" class="bronze" size="2"
            >{{ user.rank }}.
          </ion-col>
          <ion-col v-else size="2">{{ user.rank }}.</ion-col>
          <ion-col size="7" v-if="user.name === currentUser.username" class="red">
            {{ user.name }}
           </ion-col>
          <ion-col size="7" v-else-if="user.name != currentUser.username && selectedCommunity != ''" @click="togglePin(user, selectedCommunity)">
            {{ user.name }} 
            <ion-icon :icon="isPinned(user) ? heart : heartOutline"></ion-icon>
          </ion-col>
          <ion-col size="7" v-else>{{ user.name }}</ion-col>
          <ion-col>{{ user.points }}</ion-col>
        </ion-row>
        <!-- <ion-row class="userRow" v-if="currentUser.rank">
          <ion-col size="2">
            <ion-col v-if="currentUser.rank === 1" class="golden">{{ currentUser.rank }}.</ion-col>
            <ion-col v-else-if="currentUser.rank === 2" class="silver">{{ currentUser.rank }}.</ion-col>
            <ion-col v-else-if="currentUser.rank === 3" class="bronze">{{ currentUser.rank }}.</ion-col>
            <ion-col v-else>{{ currentUser.rank }}.</ion-col>
          </ion-col>
          <ion-col size="7">{{ currentUser.username }}</ion-col>
          <ion-col>{{ currentUser.points }}</ion-col>
        </ion-row>
        <ion-row v-for="user in pinnedUsers" :key="user" class="userRow">
          <ion-col size="2">{{ user.rank }}.</ion-col>
          <ion-col size="7">{{ user.userName }}</ion-col>
          <ion-col>{{ user.points }}</ion-col>
        </ion-row>
        <ion-row class="userRow" v-if="lastUser.rank">
          <ion-col size="2">{{ lastUser.rank }}.</ion-col>
          <ion-col size="7">{{ lastUser.name }}</ion-col>
          <ion-col>{{ lastUser.points }}</ion-col>
        </ion-row> -->
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Community, UserDto } from "@/generated";
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
import { chevronBack, chevronForward, heart, heartOutline } from "ionicons/icons";
import { useStore } from "vuex";
const store = useStore();

const selectedCommunity = ref("");
const currentUser = store.getters.getUser;
let communities: Community[] = [];
const leaderboard = ref();
const isLoading = ref(true);
const pageSize = ref(10);
const currentPage = ref(1);
const searchQuery = ref("");
const pinnedUsers = ref(
  JSON.parse(localStorage.getItem(`pinnedUsers_${currentUser.username}`) || "[]")
);
const lastUser = ref();
let rand;

store.watch(
  (state) => state.message,
  async (newMessage) => {
    if (newMessage.includes("getCommunityUserRanking")) {
      await getCommunityUserRanking(selectedCommunity.value);
    }
  }
);

onBeforeMount(async () => {
  try {
    const response = await apiService.communityApi.apiCommunityGet();
    communities = response.data;
    await getCommunityUserRanking(null);
  } catch (error) {
    console.error("Failed fetching communities or ranking",error);
  }
  isLoading.value = false;
});

const togglePin = (user: UserDto, communityId: string) => {
  const pinIndex = pinnedUsers.value.findIndex(
    (pin: {
      name: string | null | undefined;
      currentUserName: any;
      communityId: string | null | undefined;
      rank: number | null | undefined;
    }) => pin.name === user.name && pin.currentUserName === currentUser.username && pin.communityId === selectedCommunity.value // schauen ob passt
  );

  if (pinIndex > -1) {
    pinnedUsers.value.splice(pinIndex, 1);
  } else {
    pinnedUsers.value.push({      
      points: user.points,
      name: user.name,
      registrationDate: user.registrationDate,
      currentUserName: currentUser.username,
      communityId: communityId,
      rank: null,
    });
  }
  rand = store.getters.getAddValue;
  rand = !rand;
  localStorage.setItem(
    `pinnedUsers_${currentUser.username}`,
    JSON.stringify(pinnedUsers.value)
  );

  store.dispatch("addUser", rand)
};

const isPinned = (user: UserDto) => {
  return pinnedUsers.value.some(
    (pin: {
      name: string | null | undefined;
      currentUserName: any;
      communityId: string | null | undefined;
      rank: number | null | undefined;
    }) => pin.name === user.name && pin.currentUserName === currentUser.username && pin.communityId === selectedCommunity.value // schasuen ob passt
  );
};

const getCommunityUserRanking = async (communityId: string | null) => {
  try {
    const response = await apiService.communityApi.apiCommunityRankingGet(communityId!);

    let prevValue = 0;
    let currentRank = 1;
    leaderboard.value = response.data.members!.reduce((acc: any[], user, index) => {
      if (user.points !== prevValue) {
        currentRank = index + 1;
        prevValue = user.points!;
      }
      acc.push({
        ...user,
        rank: currentRank,
      });
      return acc;
    }, []);

    const currentUserIndex = leaderboard.value.findIndex(
      (user: { name: any }) => user.name === currentUser.username
    );
    currentUser.rank = leaderboard.value[currentUserIndex].rank;
    lastUser.value = leaderboard.value[leaderboard.value.length - 1];
    pinnedUsers.value.forEach(
      (pinnedUser: {
        name: any;
        points: any;
        currentUserName: any;
        communityId: any;
        rank: any;
      }) => {
        const pinnedUserIndex = leaderboard.value.findIndex(
          (user: { name: any }) => user.name === pinnedUser.name
        );
        if (pinnedUserIndex !== -1) {
          pinnedUser.rank = leaderboard.value[pinnedUserIndex].rank;
        } else {
          pinnedUser.rank = undefined;
        }
      }
    );
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

ion-grid {
  background-color: #141211;
  margin: 10px;
  border-radius: 7px;
}

.nameGrid {
  border: 1px solid #333232;
}

ion-row {
  padding: 5px;
}

.userRow:not(:last-child) {
  border-bottom: 1px solid #ff496117;
}

.titleRow {
  border-radius: 7px;
  background-color: #272727;
  font-weight: 600;
}

.nav {
  --background: none;
  color: var(--ion-color-primary);
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
