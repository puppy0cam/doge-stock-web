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
      <q-btn-dropdown color="primary" :label="serverSelected">
        <q-list>
          <q-item
          clickable
          v-close-popup
          v-for="key in availableServers"
          v-bind:key="key"
          @click="selectServer(key)"
          >
            <q-item-section>
              <q-item-label>{{ key }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-space />
      <q-input borderless dense debounce="300" color="primary" v-model="filter" label="Search">
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
          label: 'Id',
          field: 'cwid',
          required: true,
          align: 'left',
          sortable: true,
          sort: (a, b) => a.localeCompare(b),
        },
        {
          name: 'castle',
          label: 'Castle',
          field: 'castle',
          required: true,
          align: 'left',
          sortable: true,
          sort: (a, b) => a.localeCompare(b),
        },
        {
          name: 'ign',
          label: 'Name',
          field: 'ign',
          required: true,
          align: 'left',
          sortable: true,
          sort: (a, b) => a.localeCompare(b),
        },
        {
          name: 'guild_tag',
          label: 'Guild',
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
              return '';
            }
            if (value == null || value === '') {
              return 'None';
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
