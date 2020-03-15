<template>
  <q-item
    clickable
    tag="a"
    target="_blank"
    @click="navigateToLink"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon v-if="icon" :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ $t('nav_title_' + section) }}</q-item-label>
      <q-item-label caption>
        {{ $t('nav_caption_' + section ) }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'EssentialLink',
  props: {
    section: {
      type: String,
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    icon: {
      type: String,
      required: false,
      default: '',
    },

  },
  methods: {

    navigateToLink() {
      if (this.$route.path !== this.destination) {
        this.$router.push(this.destination);
      }
    },

  },
};
</script>
