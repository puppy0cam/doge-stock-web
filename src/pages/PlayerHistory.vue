<template>
<q-page>
  <q-table :data="history" :columns="columns" flat :filter="filter" :loading="loading">
    <template v-slot:top>
      <q-space />
      <q-input
      borderless
      dense debounce="300"
      color="primary"
      v-model="filter"
      :label="$t('player_history_search_box_label')"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
  </q-table>
</q-page>
</template>

<script>
export default {
  name: 'PagePlayerHistory',
  data() {
    return {
      history: [],
      filter: '',
      columns: [
        {
          name: 'name',
          label: this.$t('player_history_col_name_label'),
          field: 'name',
          required: true,
          align: 'left',
        },
        {
          name: 'castle',
          label: this.$t('player_history_col_castle_label'),
          field: 'castle',
          required: true,
          align: 'left',
        },
        {
          name: 'guild_tag',
          label: this.$t('player_history_col_guild_tag_label'),
          field: 'guild_tag',
          required: false,
          align: 'left',
          format: ((value) => {
            if (value === '???') {
              return '';
            }
            if (value == null || value === '') {
              return 'None';
            }
            return value;
          }),
        },
        {
          name: 'timestamp',
          label: this.$t('player_history_col_timestamp_label'),
          field: 'timestamp',
          required: true,
          align: 'left',
          format: (value) => value.toLocaleString(),
          sort: (a, b) => a.valueOf() - b.valueOf(),
          sortable: true,
        },
      ],
      loading: false,
    };
  },
  mounted() {
    this.loading = true;
    import('../contentCache.js').then((contentCache) => {
      const {
        getPlayerSpaiHistory,
      } = contentCache;
      getPlayerSpaiHistory(this.server, this.id).then((history) => {
        this.history = history;
        this.loading = false;
      }, (error) => {
        this.loading = false;
        console.error(error);
      });
    });
  },
  props: {
    server: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
};
</script>
