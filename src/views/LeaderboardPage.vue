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
              type="number"
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
                v-for="community in filteredCommunities"
                :key="community.communityId"
                :value="community.communityId"
              >
                {{ community.communityName }}
              </ion-select-option>
            </ion-select>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-grid v-if="pagedLeaderboard1.length > 0" class="nameGrid">
        <ion-row class="titleRow">
          <ion-col size="2">Rank</ion-col>
          <ion-col size="7">Name</ion-col>
          <ion-col>Points</ion-col>
        </ion-row>
        <ion-row v-for="user in pagedLeaderboard1" :key="user.name" class="userRow">
          <UserRow :user="user" :center="false"></UserRow>
          <ion-col size="7" v-if="user.name === currentUser.username" class="red">
            {{ user.name }}
          </ion-col>
          <ion-col
            size="7"
            v-else-if="user.name != currentUser.username && selectedCommunity != ''"
            @click="togglePin(user, selectedCommunity)"
          >
            {{ user.name }}
            <ion-icon :icon="isPinned(user) ? heart : heartOutline"></ion-icon>
          </ion-col>
          <ion-col size="7" v-else>{{ user.name }}</ion-col>
          <ion-col>{{ user.points }}</ion-col>
        </ion-row>
        <ion-row
          class="pagination"
          v-if="
            pagedLeaderboard1.length >= pageSize &&
            pagedLeaderboard1.length <= leaderboard.length
          "
        >
          <ion-col class="ion-text-center">
            <ion-button
              class="nav btn"
              size="small"
              @click="increasePageSize(true)"
              :disabled="
                (pageSize1 > currentUserIndex - pageSize2 &&
                  pagedLeaderboard2.length > 0) ||
                pagedLeaderboard1.length >= leaderboard.length
              "
            >
              <ion-icon slot="icon-only" :icon="chevronDown"></ion-icon>
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-grid
        v-if="pagedLeaderboard2.length > 0 && currentUserIndex > 0"
        class="nameGrid"
      >
        <ion-row class="pagination" v-if="pagedLeaderboard1.length >= pageSize">
          <ion-col class="ion-text-center">
            <ion-button
              class="nav btn"
              size="small"
              @click="increasePageSize(false)"
              :disabled="pageSize1 > currentUserIndex - pageSize2"
            >
              <ion-icon slot="icon-only" :icon="chevronUp"></ion-icon>
            </ion-button>
          </ion-col>
        </ion-row>
        <ion-row class="titleRow" v-if="pagedLeaderboard1.length < pageSize">
          <ion-col size="2">Rank</ion-col>
          <ion-col size="7">Name</ion-col>
          <ion-col>Points</ion-col>
        </ion-row>
        <ion-row v-for="user in pagedLeaderboard2" :key="user.name" class="userRow">
          <UserRow :user="user" :center="false"></UserRow>
          <ion-col size="7" v-if="user.name === currentUser.username" class="red">
            {{ user.name }}
          </ion-col>
          <ion-col
            size="7"
            v-else-if="user.name != currentUser.username || (selectedCommunity != '' || selectedCommunity != emptyGuid)"
            @click="togglePin(user, selectedCommunity)"
          >
            {{ user.name }}
            <ion-icon :icon="isPinned(user) ? heart : heartOutline"></ion-icon>
          </ion-col>
          <ion-col size="7" v-else>{{ user.name }}</ion-col>
          <ion-col>{{ user.points }}</ion-col>
        </ion-row>
      </ion-grid>

      <ion-grid class="nameGrid" v-if="pinnedUsers.length > 0">
        <ion-row v-for="user in pinnedUsers" :key="user" class="userRow">
          <UserRow :user="user" :center="false"></UserRow>
          <ion-col size="7"
            >{{ user.name }}
            <ion-icon :icon="heart"></ion-icon>
          </ion-col>
          <ion-col>{{ user.points }}</ion-col>
        </ion-row>
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
import { ref, onBeforeMount, computed, Ref, watch } from "vue";
import { chevronDown, chevronUp, heart, heartOutline } from "ionicons/icons";
import { useStore } from "vuex";
import  UserRow  from "../components/UserRow.vue"

const store = useStore();

const emptyGuid = "00000000-0000-0000-0000-000000000000";
const selectedCommunity = ref();
const currentUser = store.getters.getUser;
const communities = ref<Community[]>([]);
const leaderboard = ref();
const isLoading = ref(true);
const pageSize = ref(10);
const searchQuery = ref("");
const pinnedUsers = ref(
  JSON.parse(localStorage.getItem(`pinnedUsers_${currentUser.username}`) || "[]")
);
let rand;
const globalLeaderboard = ref();

store.watch(
  (state) => ({
    communityId: state.communityId,
  }),
  async ({ communityId }) => {
    if (communityId !== selectedCommunity.value) {
      if (communityId === emptyGuid) {
        selectedCommunity.value = "";
      } else selectedCommunity.value = communityId;
      await getCommunityUserRanking(selectedCommunity.value);
    }
  }
);

store.subscribe(async (mutation, state) => {
  if (mutation.type === "setMessage") {
    if (state.message.includes("getCommunityUserRanking")) {    
      if(selectedCommunity.value === "")
      {
        await getCommunityUserRanking(null);

      } else await getCommunityUserRanking(selectedCommunity.value);
      await savePinnedUsers()
    }
  }
  if(mutation.type === "setAdd"){
    await store.dispatch("fetchUserCommunities");
    communities.value = store.getters.getUserCommunities;
  }
});

onBeforeMount(async () => {
  selectedCommunity.value = "";
  try {
    await store.dispatch("fetchUserCommunities");
    communities.value = store.getters.getUserCommunities;
    await getPinnedUsers();
    await getCommunityUserRanking(selectedCommunity.value);
    await getCurrentUserIndex(leaderboard.value);
  } catch (error) {
    console.error("Failed fetching communities or ranking", error);
  }
  isLoading.value = false;
});

const filteredCommunities = computed(() => {
  return communities.value.filter((community) => community.communityName !== "Global");
});

interface PinUser {
  points: number;
  name: string | null | undefined;
  registrationDate: string;
  currentUserName: string;
  communityId: string | null | undefined;
  rank: number | null | undefined;
}

async function togglePin(user: UserDto, communityId: string) {
  const pinIndex = pinnedUsers.value.findIndex(
    (pin: PinUser) =>
      pin.name === user.name && pin.currentUserName === currentUser.username
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
  
  rand = !store.getters.getAddValue;
  localStorage.setItem(
    `pinnedUsers_${currentUser.username}`,
    JSON.stringify(pinnedUsers.value)
  );
  await getPinnedUsers();
  store.dispatch("addUser", rand);
}

const isPinned = (user: UserDto) => {
  return pinnedUsers.value.some(
    (pin: PinUser) =>
      pin.name === user.name && pin.currentUserName === currentUser.username
  );
};

async function savePinnedUsers() { 
  const updatedPinnedUsers = pinnedUsers.value.map((pinnedUser: PinUser) => {
    const updatedPoints = findUpdatedPoints(pinnedUser);
    return {
      ...pinnedUser,
      points: updatedPoints,
    };
  });
  pinnedUsers.value = updatedPinnedUsers;
  localStorage.setItem(
    `pinnedUsers_${currentUser.username}`,
    JSON.stringify(updatedPinnedUsers)
  );

  await getPinnedUsers();
}


function findUpdatedPoints(pinnedUser: PinUser) {
  const userInLeaderboard = leaderboard.value.find((user: UserDto) => user.name === pinnedUser.name);
  if (userInLeaderboard) {
    return userInLeaderboard.points;
  } else {
    return pinnedUser.points;
  }
}

async function getPinnedUsers() {
  const response = await apiService.communityApi.apiCommunityRankingGet();
  globalLeaderboard.value = calculateRank(response.data.members!);

  currentUserIndex.value = globalLeaderboard.value.findIndex(
    (user: PinUser) => user.name === currentUser.username
  );

  if (currentUserIndex.value !== -1) {
    currentUser.rank = globalLeaderboard.value[currentUserIndex.value].rank;
  }

  pinnedUsers.value = [
    ...new Map(
      pinnedUsers.value.map((user: { name: any }) => [user.name, user])
    ).values(),
  ];

  pinnedUsers.value.sort((a: UserDto, b: UserDto) => {
    if (a.points !== b.points) {
      return b.points! - a.points!;
    }
    return (
      new Date(b.registrationDate!).getTime() - new Date(a.registrationDate!).getTime()
    );
  });

  pinnedUsers.value.forEach((pinnedUser: PinUser) => {
    const pinnedUserIndex = globalLeaderboard.value.findIndex(
      (user: PinUser) => user.name === pinnedUser.name
    );
    if (pinnedUserIndex !== -1) {
      pinnedUser.rank = globalLeaderboard.value[pinnedUserIndex].rank;
    } else {
      pinnedUser.rank = undefined;
    }
  });
}

function calculateRank(users: UserDto[]): UserDto[] {
  let prevValue = 0;
  let currentRank = 1;
  return users.reduce((acc: any[], user, index) => {
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
}

async function getCommunityUserRanking(communityId: string | null) {
  try {
    if (communityId === emptyGuid || communityId === "") {
      leaderboard.value = globalLeaderboard.value;
    } else {
      const response = await apiService.communityApi.apiCommunityRankingGet(communityId!);
      store.commit("setCommunityId", communityId);
      leaderboard.value = calculateRank(response.data.members!);

      currentUserIndex.value = leaderboard.value.findIndex(
        (user: { name: any }) => user.name === currentUser.username
      );

      if (currentUserIndex.value !== -1) {
        currentUser.rank = leaderboard.value[currentUserIndex.value].rank;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

const performSearch = () => {
  currentPage1.value = 1;
};

const pageSize1 = ref(10);
const pageSize2 = ref(10);
watch(pageSize, (newValue) => {
  pageSize1.value = parseInt(newValue.toString());
  pageSize2.value = parseInt(newValue.toString());
});
const currentPage1 = ref(1);
const currentPage2 = ref(1);
const currentUserIndex = ref(0);

const filteredLeaderboard = computed(() => {
  if (searchQuery.value) {
    return leaderboard.value.filter((user: { name: string }) =>
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  return leaderboard.value;
});

async function getCurrentUserIndex(leaderboard: any) {
  currentUserIndex.value = leaderboard.findIndex(
    (user: { name: any }) => user.name === currentUser.username
  );
  currentPage2.value = Math.ceil((currentUserIndex.value + 1) / pageSize2.value);
}

const pagedLeaderboard1 = computed(() => {
  const startIndex = (currentPage1.value - 1) * pageSize1.value;
  const endIndex = startIndex + pageSize1.value;

  if (currentUserIndex.value === -1 || currentUserIndex.value <= 9) {
    return filteredLeaderboard.value.slice(startIndex, endIndex);
  } else
    return filteredLeaderboard.value.slice(
      startIndex,
      Math.min(endIndex, currentUserIndex.value)
    );
});

const pagedLeaderboard2 = computed(() => {
  const startIndex = Math.max(pageSize1.value, currentUserIndex.value - pageSize2.value + 1);
  const endIndex = startIndex + pageSize2.value;
  if (
    currentUserIndex.value === -1 ||
    currentUserIndex.value <= 9 ||
    searchQuery.value !== ""
  ) {
    return [];
  } else return filteredLeaderboard.value.slice(startIndex, endIndex);
});

const changePageSize = (pageSize: Ref<any>, increment: any) => {
  const newValue = parseInt(pageSize.value) + parseInt(increment);
  pageSize.value = newValue;
};
const increasePageSize = (increaseLeaderboard1: boolean) => {
  const isOverlapping = pageSize1.value > currentUserIndex.value - pageSize2.value;
  if (!isOverlapping) {
    const targetPageSize = increaseLeaderboard1 ? pageSize1 : pageSize2;
    changePageSize(targetPageSize, pageSize.value);
  }
  if (pagedLeaderboard2.value.length === 0) {
    changePageSize(pageSize1, pageSize.value);
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

ion-icon {
  vertical-align: top;
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

.red {
  color: var(--ion-color-primary);
}
</style>
