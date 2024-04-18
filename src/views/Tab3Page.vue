<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 3</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 3</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-item v-for="community in userCommunities" :key="community.communityId!">{{community.communityName}}
      <ion-item v-for="user in community.members" :key="user.userId">{{user.username}}</ion-item>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonItem, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import apiService from "@/services/apiService";
import { CommunityMembersDto, User } from '@/generated';
import { onBeforeMount } from 'vue';

const currentUserJson = sessionStorage.getItem("currentuser");
const currentUser: User = JSON.parse(currentUserJson!);
let userCommunities: CommunityMembersDto[] = [];
onBeforeMount(async () => {
  try{
    const response = await apiService.userCommunityApi.apiUserCommunityShowUserCommunitiesGet(currentUser.userId);
    const data = response.data;
    userCommunities = data;
    console.log(userCommunities)
  }catch(error){
    console.log("Error fetching communities", error);
  }
})
</script>
