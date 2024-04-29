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
      <ion-grid v-for="community in userCommunities" :key="community.communityId!">
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
            <ion-button :id="'member-view-' + community.communityId" size="small" class="actionBtn">
              <ion-icon slot="icon-only" :icon="informationCircleOutline"></ion-icon>
            </ion-button>
          </ion-col>
          <ion-popover :trigger="'member-view-' + community.communityId">
            <ion-content>
              <ion-grid>
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
            <ion-button @click="joinCommunity(community.communityId!)" size="small" class="actionBtn">
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

const currentUserJson = sessionStorage.getItem("currentuser");
const currentUser: User = JSON.parse(currentUserJson!);
let userCommunities: CommunityMembersDto[] = [];
let allCommunities: Community[] = [];
const isLoading = ref(true);

const createAlert = async () => {
  const alert = await createAlertController();
  await alert.present();
};

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
    await getCommunites();
    await getUserCommunities();
  } catch (error) {
    console.log(error);
  }
};

onBeforeMount(async () => {
  try {
    await getUserCommunities();
  } catch (error) {
    console.log("Error fetching communities", error);
  }
  try {
    await getCommunites();
  } catch (error) {
    console.log(error);
  }
  isLoading.value = false;
});

async function getUserCommunities() {
  const response = await apiService.userCommunityApi.apiUserCommunityShowUserCommunitiesGet(
    currentUser.userId
  );
  const data = response.data;
  userCommunities = data;
}

async function getCommunites() {
  const response = await apiService.communityApi.apiCommunityCommunitesWithoutUserGet(
    currentUser.userId
  );
  allCommunities = response.data;
}

async function joinCommunity(communityId: string) {
  try {
    await apiService.communityApi.apiCommunityJoinCommunityPost(
      currentUser.userId,
      communityId
    );
    await getUserCommunities();
    await getCommunites();
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

  ion-label{
    font-size: 17px;
    margin: 0 5px;
    font-weight: 600;
  }
}

.actionBtn{
  font-size: 14px;
}

ion-grid {
  border: 1px solid #333232;
  background-color: #141211;
  margin: 10px;
  border-radius: 7px;
}
</style>
