<template>
<q-page>
  <q-table
    :pagination.sync="pagination"
    :data="history"
    :columns="columns"
    flat
    :filter="filter"
    :loading="loading"
  >
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
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td :props="props" v-for="key in props.cols" :key="key.name">
          {{ key.value }}
        </q-td>
        <q-menu v-if="props.row.guild_tag" touch-position>
          <q-item v-if="props.row.guild_tag" clickable @click="viewPlayerGuild($event, props.row)">
            <q-item-section>{{ $t('player_history_table_view_guild') }}</q-item-section>
          </q-item>
        </q-menu>
      </q-tr>
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
      pagination: {
        page: 1,
        // eslint-disable-next-line no-restricted-globals
        rowsPerPage: Math.min(Math.max(Math.floor((screen.availHeight - 200) / 50), 6), 26) - 1,
        sortBy: 'timestamp',
        descending: true,
      },
      loading: false,
    };
  },
  mounted() {
    this.refresh();
  },
  methods: {
    async refresh() {
      this.loading = true;
      try {
        const {
          getPlayerSpaiHistory,
        } = await import('../contentCache.js');
        this.history = await getPlayerSpaiHistory(this.server, this.id);
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    viewPlayerGuild(event, row) {
      this.$router.push(`/guildmembers/${this.server}/${row.guild_tag}`);
    },
  },
  watch: {
    server(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.refresh();
      }
    },
    id(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.refresh();
      }
    },
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
