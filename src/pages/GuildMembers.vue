<template>
<q-page>
  <q-table
  :data="members"
  :columns="columns"
  flat
  :filter="filter"
  :loading="loading"
  @row-click="onClickRow"
  >
    <template v-slot:top>
      <q-space />
      <q-input
      borderless
      dense
      debounce="300"
      color="primary"
      v-model="filter"
      :label="$t('guild_members_search_box_label')">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
  </q-table>
</q-page>
</template>

<script>
import { getGuildMembers } from '../contentCache';

export default {
  name: 'PageGuildMembers',
  data() {
    return {
      members: [],
      columns: [
        {
          name: 'cwid',
          label: this.$t('guild_members_col_cwid_label'),
          field: 'cwid',
          required: true,
          align: 'left',
        },
        {
          name: 'ign',
          label: this.$t('guild_members_col_ign_label'),
          field: 'ign',
          required: true,
          align: 'left',
        },
        {
          name: 'castle',
          label: this.$t('guild_members_col_castle_label'),
          field: 'castle',
          required: false,
          align: 'left',
        },
      ],
      filter: '',
      loading: false,
    };
  },
  mounted() {
    this.loading = true;
    getGuildMembers(this.server, this.tag).then((members) => {
      this.members = members;
      this.loading = false;
    }, (error) => {
      this.loading = false;
      console.error(error);
    });
  },
  props: {
    server: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      required: true,
    },
  },
  methods: {
    onClickRow(event, row) {
      this.$router.push(`/playerhistory/${this.server}/${row.cwid}`);
    },
  },
};
</script>
