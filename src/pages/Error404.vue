<template>
  <div class="fixed-center text-center">
    <p>
      <img
        src="~assets/sad.svg"
        style="width:30vw;max-width:150px;"
      >
    </p>
    <p class="text-faded">
      {{ $t('page_404_text') }}
    </p>
    <q-btn
      color="secondary"
      style="width:200px;"
      to="/"
      :label="$t('page_404_home_btn_label')"
    />
  </div>
</template>

<script>
export default {
  name: 'Error404',
};
</script>
