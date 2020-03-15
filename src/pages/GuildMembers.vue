<template>
<q-page>
  <q-table :data="members" :columns="columns" flat :filter="filter" :loading="loading">
    <q-space />
    <q-input borderless dense debounce="300" color="primary" v-model="filter" label="Search">
      <template v-slot:append>
        <q-icon name="search" />
      </template>
    </q-input>
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
          label: 'Id',
          field: 'cwid',
          required: true,
          align: 'left',
        },
        {
          name: 'ign',
          label: 'Name',
          field: 'ign',
          required: true,
          align: 'left',
        },
        {
          name: 'castle',
          label: 'Castle',
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
};
</script>
