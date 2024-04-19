<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content v-if="isLoading">
      <ion-spinner ></ion-spinner>
    </ion-content>
    <ion-content v-else>
        <ion-select>
            <ion-select-option
              v-for="community in communities"
              :key="community.communityId"
              >{{ community.communityName }}
              </ion-select-option>
          </ion-select>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Community } from "@/generated";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonSelect, IonSelectOption } from "@ionic/vue";
import apiService from "@/services/apiService";
import { ref, onBeforeMount } from "vue";

let communities: Community[] = [];
const isLoading = ref(true);

onBeforeMount(async () => {
  try {
    const response = await apiService.communityApi.apiCommunityGet();
    communities = response.data;
  } catch (error) {
    console.log(error);
  }
  isLoading.value = false;
});
</script>
