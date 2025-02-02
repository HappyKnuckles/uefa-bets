<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Communities</ion-title>
        <ion-button slot="end" @click="createAlert" class="addBtn">
          <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content v-if="isLoading">
      <ion-spinner></ion-spinner>
    </ion-content>

    <ion-content :fullscreen="true" v-else>
      <h2>Your Communities</h2>
      <ion-grid v-for="community in communityWithMembers" :key="community.communityId!">
        <ion-row class="titleRow">
          <ion-col size="10">
            <ion-label>
              {{ community.communityName }}
            </ion-label>
            <ion-badge>
              {{ community.communityPoints }}
            </ion-badge>
          </ion-col>
          <ion-col>
            <ion-button
              :id="'member-view-' + community.communityId"
              size="small"
              class="actionBtn"
            >
              <ion-icon slot="icon-only" :icon="informationCircleOutline"></ion-icon>
            </ion-button>
          </ion-col>
          <ion-popover :trigger="'member-view-' + community.communityId" side="left">
            <ion-content>
              <ion-grid class="popover-grid">
                <ion-row v-for="user in community.members" :key="user.name!">
                  {{ user.name }}
                </ion-row>
              </ion-grid>
            </ion-content>
          </ion-popover>
        </ion-row>
      </ion-grid>
      <h2>All Communities</h2>
      <ion-grid v-for="community in allCommunities" :key="community.communityId">
        <ion-row class="titleRow">
          <ion-col size="10">
            <ion-label>
              {{ community.communityName }}
            </ion-label>
            <ion-badge>
              {{ community.communityPoints }}
            </ion-badge>
          </ion-col>
          <ion-col>
            <ion-button
              @click="joinCommunity(community.communityId!)"
              size="small"
              class="actionBtn"
            >
              Join
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonCol,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonButton,
  IonSpinner,
  alertController,
  IonBadge,
  IonPopover,
  IonRow,
  IonGrid,
  IonLabel,
} from "@ionic/vue";
import apiService from "@/services/apiService";
import { Community, CommunityMembersDto, User } from "@/generated";
import { onBeforeMount, ref } from "vue";
import { addOutline, informationCircleOutline } from "ionicons/icons";
import { useStore } from "vuex";
const store = useStore();
const currentUser: User = store.getters.getUser;
const communityWithMembers = ref<CommunityMembersDto[]>([]);
const allCommunities = ref<Community[]>([]);
const isLoading = ref(true);
const createAlert = async () => {
  const alert = await createAlertController();
  await alert.present();
};
let rand;

store.subscribe(async (mutation, state) => {
  if (mutation.type === "setMessage") {
    if (state.message.includes("getGames")) {
      await getUserCommunities();
    }
  }
});

const createAlertController = async () => {
  const alert = await alertController.create({
    header: "New Community",
    message: "Input name to create a Community",
    inputs: [
      {
        name: "communityname",
        type: "text",
        placeholder: "Communityname",
      },
    ],
    buttons: [
      {
        text: "Cancel",
        role: "cancel",
      },
      {
        text: "Create",
        handler: (data) => {
          handleAlertInput(data.communityname);
        },
      },
    ],
  });

  return alert;
};

const handleAlertInput = async (communityname: string | undefined) => {
  try {
    await apiService.communityApi.apiCommunityCreateAndJoinCommunityPost(
      currentUser.userId,
      communityname
    );
    rand = !store.getters.getAddValue;
    store.dispatch("addUser", rand);
    await getUserCommunities();
    await getCommunites();
  } catch (error) {
    console.error(error);
  }
};

onBeforeMount(async () => {
  try {
    await getUserCommunities();
  } catch (error) {
    console.error("Error fetching usercommunities", error);
  }
  try {
    await getCommunites();
  } catch (error) {
    console.error("error fetching communities", error);
  }
  isLoading.value = false;
});

async function getUserCommunities() {
  if (!store.getters.getLoadingUserCommunities) {
    await store.dispatch("fetchUserCommunities");
  }
  setTimeout(function () {
    communityWithMembers.value = store.getters.getUserCommunities;
  }, 500);
}

async function getCommunites() {
  const response = await apiService.communityApi.apiCommunityCommunitesWithoutUserGet(
    currentUser.userId
  );
  allCommunities.value = response.data;
}

async function joinCommunity(communityId: string) {
  try {
    await apiService.communityApi.apiCommunityJoinCommunityPost(
      currentUser.userId,
      communityId
    );
    await getUserCommunities();
    await getCommunites();
    rand = !store.getters.getAddValue;
    store.dispatch("addUser", rand);
  } catch (error) {
    console.log(error);
  }
}
</script>
<style scoped>
.addBtn {
  --background: none;

  ion-icon {
    color: white;
  }
}

.titleRow {
  display: flex;
  align-items: center;

  ion-label {
    font-size: 17px;
    margin: 0 5px;
    font-weight: 600;
  }
}

h2 {
  margin-left: 15px;
  font-weight: 600;
}

.actionBtn {
  font-size: 14px;
}

.popover-grid {
  padding: 10px;

  ion-row:not(:last-child) {
    margin-bottom: 5px;
  }
}

ion-grid:not(.popover-grid) {
  border: 1px solid #333232;
  background-color: #141211;
  margin: 15px 10px;
  border-radius: 7px;
}
</style>
