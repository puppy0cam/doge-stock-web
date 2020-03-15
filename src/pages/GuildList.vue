<template>
<q-page>
  <q-table
  :loading="loading"
  :data="guilds"
  :columns="columns"
  flat
  :filter="filter"
  @row-click="clickGuildRow"
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
import { getAllGuilds } from '../contentCache';

export default {
  name: 'PageGuildList',
  data() {
    return {
      guilds: [],
      columns: [
        {
          name: 'tag',
          label: 'Guild tag',
          field: 'tag',
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
      ],
      loading: false,
      filter: '',
      serverSelected: 'EUCW',
      availableServers: ['EUCW', 'RU'],
    };
  },
  mounted() {
    this.loading = true;
    getAllGuilds(this.serverSelected).then((data) => {
      this.guilds = data;
      this.loading = false;
    }, (error) => {
      this.loading = false;
      console.error(error);
    });
  },
  methods: {
    clickGuildRow(event, row) {
      this.$router.push(`/guildmembers/${this.serverSelected}/${row.tag}`);
    },
    selectServer(key) {
      this.serverSelected = key;
      this.loading = true;
      getAllGuilds(this.serverSelected).then((data) => {
        this.guilds = data;
        this.loading = false;
      }, (error) => {
        this.loading = false;
        console.error(error);
      });
    },
  },
};
</script>
