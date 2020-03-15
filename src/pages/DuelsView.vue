<template>
<q-page>
  <q-table :data="duels" :columns="columns" flat :filter="filter">
    <template v-slot:top>
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
import { duels } from '../contentCache';
/** @param {{id:string;name:string;tag?:string;castle:string;level:number;hp:number;}} player */
function formatPlayer(player) {
  return `${player.castle}${player.tag ? `[${player.tag}]` : ''}${player.name}`;
}
export default {
  name: 'PageDuelsView',
  data() {
    return {
      duels,
      filter: '',
      columns: [
        {
          name: 'server',
          label: 'Server',
          field: 'server',
          required: true,
          align: 'left',
        },
        {
          name: 'winner',
          label: 'Winner',
          field: (row) => row.data.winner,
          format: formatPlayer,
        },
        {
          name: 'loser',
          label: 'Loser',
          field: (row) => row.data.loser,
          format: formatPlayer,
        },
      ],
    };
  },
};

</script>
