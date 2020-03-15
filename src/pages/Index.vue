<template>
  <q-page class="flex flex-center">
    <q-markdown>{{ $t('home_page_content') }}</q-markdown>
  </q-page>
</template>

<style src="@quasar/quasar-ui-qmarkdown/dist/index.css"></style>

<script>
export default {
  name: 'PageIndex',
};
</script>

<style scoped>
.flex-center {
  align-items: normal;
}
</style>
