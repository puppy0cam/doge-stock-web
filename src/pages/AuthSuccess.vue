<template>
<q-page>
  <h3>{{ $t('auth_success_header') }}</h3>
  <q-card v-if="userData" class="userDataCard">
    <img v-if="userData.photo_url" :src="userData.photo_url" class="userProfileImage" />
    <p>{{ userData.first_name }} {{ userData.last_name }}</p>
  </q-card>
  <p v-else>{{ $t('auth_success_waiting_text') }}</p>
</q-page>
</template>

<script>
import { getTelegramUserDetails, registerUserToken } from '../contentCache.js';

export default {
  name: 'AuthSucccess',
  data() {
    return {
      /** @type {ReturnType<typeof getTelegramUserDetails> | null} */
      userData: null,
    };
  },
  mounted() {
    registerUserToken(this.token).then(() => {
      getTelegramUserDetails().then((response) => {
        this.userData = response;
      }, (error) => {
        console.error(error);
      });
    }, (error) => {
      console.error(error);
    });
  },
  props: {
    token: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.userDataCard {
  display: flex;
}
.userProfileImage {
  max-height: 50px;
  width: inherit;
}
</style>
