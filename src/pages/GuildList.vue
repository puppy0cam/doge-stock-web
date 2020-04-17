<template>
<q-page>
  <q-table
  :loading="loading"
  :data="guilds"
  :columns="columns"
  flat
  :filter="filter"
  @row-click="clickGuildRow"
  :pagination.sync="pagination"
  >
    <template v-slot:top>
      <q-btn-dropdown
      color="primary"
      :label="$t('guild_list_option_serverSelected_value_' + serverSelected)"
      >
        <q-list>
          <q-item
          clickable
          v-close-popup
          v-for="key in availableServers"
          v-bind:key="key"
          @click="selectServer(key)"
          >
            <q-item-section>
              <q-item-label>
                {{ $t('guild_list_option_serverSelected_dropdown_' + key) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-space />
      <q-input
      borderless
      dense
      debounce="300"
      color="primary"
      v-model="filter"
      :label="$t('guild_list_search_box_label')"
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
  name: 'PageGuildList',
  data() {
    return {
      guilds: [],
      columns: [
        {
          name: 'tag',
          label: this.$t('guild_list_col_tag_label'),
          field: 'tag',
          required: true,
          align: 'left',
          sortable: true,
          sort: (a, b) => a.localeCompare(b),
        },
        {
          name: 'castle',
          label: this.$t('guild_list_col_castle_label'),
          field: 'castle',
          required: true,
          align: 'left',
          sortable: true,
          sort: (a, b) => a.localeCompare(b),
        },
      ],
      loading: false,
      pagination: {
        page: 1,
        // eslint-disable-next-line no-restricted-globals
        rowsPerPage: Math.min(Math.max(Math.floor((screen.availHeight - 200) / 50), 6), 26) - 1,
      },
      filter: '',
      serverSelected: 'EUCW',
      availableServers: ['EUCW', 'RU'],
    };
  },
  mounted() {
    this.selectServer(this.serverSelected);
  },
  methods: {
    clickGuildRow(event, row) {
      this.$router.push(`/guildmembers/${this.serverSelected}/${row.tag}`);
    },
    selectServer(key) {
      this.serverSelected = key;
      this.loading = true;
      import('../contentCache.js').then((contentCache) => {
        const {
          getAllGuilds,
        } = contentCache;
        getAllGuilds(this.serverSelected).then((data) => {
          this.guilds = data;
          this.loading = false;
        }, (error) => {
          this.loading = false;
          console.error(error);
        });
      });
    },
  },
};
</script>
