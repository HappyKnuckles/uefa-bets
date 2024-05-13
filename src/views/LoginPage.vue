<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <form @submit.prevent="login">
        <ion-input
          label="Username:"
          type="text"
          v-model="loginForm.username"
          id="username"
          helper-text="If you aren't registered yet, an account will be created"
        >
          <ion-button slot="end" type="submit">Login</ion-button>
        </ion-input>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/apiService";
import { IonInput, IonButton, IonHeader, IonToolbar, IonTitle, IonPage, IonContent } from "@ionic/vue";
import { useStore } from "vuex";
const loginForm = ref({
  username: "",
});
const router = useRouter();

const store = useStore();

async function login() {
  try {
    const response = await apiService.userApi.apiUserLoginGet(loginForm.value.username);
    const userData = response.data;
    sessionStorage.setItem("currentuser", JSON.stringify(userData));
    store.commit("setUser", userData)
    router.push("/tabs/dashboard");
    return {
      loginForm,
      login,
    };
  } catch (error) {
    console.error("Login failed:", error);
  }
}
</script>
<style scoped>
form {
  display: flex;
  height: 75%;
  justify-content: center;
  align-items: center;  
  padding: 15px;
}
</style>
