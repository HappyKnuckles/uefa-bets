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
      <ion-list :inset="true">
        <ion-item v-for="community in userCommunities" :key="community.communityId!">
          <ion-label>
            {{ community.communityName }}
            <ion-badge>
              {{ community.communityPoints }}
            </ion-badge>
          </ion-label>
          <ion-button :id="'member-view-' + community.communityId">
            <ion-icon slot="icon-only" :icon="informationCircleOutline"></ion-icon>
          </ion-button>
          
          <ion-popover :trigger="'member-view-' + community.communityId">
            <ion-content>
              <ion-grid>
                <ion-row v-for="user in community.members" :key="user.name!">
                  {{ user.name }}
                </ion-row>
              </ion-grid>
            </ion-content>
          </ion-popover>
          
        </ion-item>
      </ion-list>
      <h2>All Communities</h2>
      <ion-list :inset="true">
        <ion-item v-for="community in allCommunities" :key="community.communityId">
          <ion-label>
            {{ community.communityName }}
            <ion-badge>
              {{ community.communityPoints }}
            </ion-badge>
          </ion-label>

          <ion-button @click="joinCommunity(community.communityId!)" slot="end">
            Join
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonItem,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonButton,
  IonSpinner,
  alertController,
  IonList,
  IonLabel,
  IonBadge,
  IonPopover,
  IonRow,
  IonGrid
} from "@ionic/vue";
import apiService from "@/services/apiService";
import { Community, CommunityMembersDto, User } from "@/generated";
import { onBeforeMount, ref } from "vue";
import {
  addOutline,
  informationCircleOutline,
} from "ionicons/icons";

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
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Create',
        handler: (data) => {
          handleAlertInput(data.communityname);
        }
      }
    ]
  });

  return alert;
};


const handleAlertInput = async (communityname: string | undefined) => {
  try {
    await apiService.communityApi.apiCommunityCreateAndJoinCommunityPost(
      currentUser.userId,
      communityname
    );
  } catch (error) {
    console.log(error);
  }
};

onBeforeMount(async () => {
  try {
    const response = await apiService.userCommunityApi.apiUserCommunityShowUserCommunitiesGet(
      currentUser.userId
    );
    const data = response.data;
    userCommunities = data;
  } catch (error) {
    console.log("Error fetching communities", error);
  }
  try {
    const response = await apiService.communityApi.apiCommunityCommunitesWithoutUserGet(
      currentUser.userId
    );
    allCommunities = response.data;
  } catch (error) {
    console.log(error);
  }
  isLoading.value = false;
});

async function joinCommunity(communityId: string) {
  try {
    await apiService.communityApi.apiCommunityJoinCommunityPost(
      currentUser.userId,
      communityId
    );
  } catch (error) {
    console.log(error);
  }
}
</script>
<style scoped>
.addBtn{
  --background: none;
  
  ion-icon{
    color: white;
  }
}
</style>
