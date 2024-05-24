<template>
  <ion-col
    :class="[center ? 'ion-text-center' : 'ion-text-left', rankClass(props.user.rank)]"
    size="2"
  >
    {{ props.user.rank }}.
  </ion-col>
</template>

<script setup lang="ts">
import { UserDto } from "../generated/api";
import { IonCol } from "@ionic/vue";


interface ExtendedUserDto extends UserDto {
  rank: number | null | undefined;
  communityId: any;
}

const props = defineProps<{
  user: ExtendedUserDto;
  center: boolean;
}>();

function rankClass(rank: number) {
  switch (rank) {
    case 1:
      return "golden";
    case 2:
      return "silver";
    case 3:
      return "bronze";
    default:
      return "";
  }
}
</script>
<style scoped>
.golden {
  color: gold;
}

.silver {
  color: silver;
}

.bronze {
  color: #cd7f32;
}
</style>
