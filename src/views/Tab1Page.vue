<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Communities</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div>
        <ul>
          <li v-for="item in community" :key="item.id">{{ item.communityName }}</li>
        </ul>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'; // Import necessary Vue functions
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';

import { Configuration, CommunityApi } from '@/generated'; // Import the CommunityApi class and Configuration

const community = ref([]);

// Create a configuration object with the base URL set to https://localhost:44320
const configuration = new Configuration({ basePath: 'https://localhost:44320' });

// Create an instance of CommunityApi with the configuration
const communityApi = new CommunityApi(configuration);

// Fetch community data when the component is mounted
onMounted(async () => {
  try {
    // Call the specific API function to get community data
    const response = await communityApi.apiCommunityGet();
    const data = await response.data;
    // Update the community data
    community.value = data;
    console.log(community.value)
  } catch (error) {
    console.error('Error fetching community data:', error);
  }
});
</script>



<style scoped>
/* Add custom styles if needed */
</style>
