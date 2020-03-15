<template>
<q-page>
  <q-table
  :loading="loading"
  :data="players"
  :columns="columns"
  flat
  :filter="filter"
  @row-click="clickPlayerRow"
  >
    <template v-slot:top>
      <q-btn-dropdown
      color="primary"
      :label="$t('player_list_option_serverSelected_value_' + serverSelected)"
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
                {{ $t('player_list_option_serverSelected_dropdown_' + key) }}
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
      :label="$t('player_list_search_box_label')"
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
import { getAllPlayers } from '../contentCache';

export default {
  name: 'PagePlayerList',
  data() {
    return {
      players: [],
      columns: [
        {
          name: 'cwid',
          label: this.$t('player_list_col_cwid_label'),
          field: 'cwid',
          required: true,
          align: 'left',
          sortable: true,
          sort: (a, b) => a.localeCompare(b),
        },
        {
          name: 'castle',
          label: this.$t('player_list_col_castle_label'),
          field: 'castle',
          required: true,
          align: 'left',
          sortable: true,
          sort: (a, b) => a.localeCompare(b),
        },
        {
          name: 'ign',
          label: this.$t('player_list_col_ign_label'),
          field: 'ign',
          required: true,
          align: 'left',
          sortable: true,
          sort: (a, b) => a.localeCompare(b),
        },
        {
          name: 'guild_tag',
          label: this.$t('player_list_col_guild_tag_label'),
          field: 'guild_tag',
          required: false,
          align: 'left',
          sortable: true,
          sort: (a, b) => {
            if (a == null && b == null) {
              return 0;
            }
            if (a == null) {
              return 1;
            }
            if (b == null) {
              return -1;
            }
            return a.localeCompare(b);
          },
          format: (value) => {
            if (value === '???') {
              return this.$t('player_list_col_guild_tag_value_unknown');
            }
            if (value == null || value === '') {
              return this.$t('player_list_col_guild_tag_value_empty');
            }
            return value;
          },
        },
      ],
      loading: false,
      filter: '',
      serverSelected: 'EUCW',
      availableServers: ['EUCW', 'RU'],
    };
  },
  mounted() {
    this.loading = true;
    getAllPlayers(this.serverSelected).then((data) => {
      this.players = data;
      this.loading = false;
    }, (error) => {
      this.loading = false;
      console.error(error);
    });
  },
  methods: {
    clickPlayerRow(event, row) {
      this.$router.push(`/playerhistory/${this.serverSelected}/${row.cwid}`);
    },
    selectServer(key) {
      this.serverSelected = key;
      this.loading = true;
      getAllPlayers(this.serverSelected).then((data) => {
        this.players = data;
        this.loading = false;
      }, (error) => {
        this.loading = false;
        console.error(error);
      });
    },
  },
};
</script>
