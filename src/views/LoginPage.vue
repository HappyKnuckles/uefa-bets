<template>
  <div>
    <form @submit.prevent="login">
      <label for="username">Username:</label>
      <input type="text" v-model="loginForm.username" id="username" />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/apiService";

const loginForm = ref({
  username: "",
});

const router = useRouter();

async function login() {
  try {
    const response = await apiService.userApi.apiUserLoginGet(loginForm.value.username);
    const userData = response.data;
    sessionStorage.setItem("currentuser", JSON.stringify(userData));

    router.push("/tabs/tab1");
    return {
      loginForm,
      login,
    };
  } catch (error) {
    console.error("Login failed:", error);
  }
}
</script>
