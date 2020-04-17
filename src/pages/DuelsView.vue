<template>
<q-page>
  <q-table :data="duels" :columns="columns" flat :filter="filter" :pagination.sync="pagination">
    <template v-slot:top>
      <q-space />
      <q-input
      borderless
      dense
      debounce="300"
      color="primary"
      v-model="filter"
      :label="$t('duels_view_search_bar_label')"
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
        <q-menu touch-position>
          <q-item clickable @click="viewFightWinner($event, props.row)">
            <q-item-section>{{ $t('duels_table_option_view_winning_player') }}</q-item-section>
          </q-item>
          <q-item
          v-if="props.row.data.winner.tag"
          clickable
          @click="viewFightWinnerGuild($event, props.row)">
            <q-item-section>{{ $t('duels_table_option_view_winning_guild') }}</q-item-section>
          </q-item>
          <q-item clickable @click="viewFightLoser($event, props.row)">
            <q-item-section>{{ $t('duels_table_option_view_losing_player') }}</q-item-section>
          </q-item>
          <q-item
          v-if="props.row.data.loser.tag"
          clickable
          @click="viewFightLoserGuild($event, props.row)">
            <q-item-section>{{ $t('duels_table_option_view_losing_guild') }}</q-item-section>
          </q-item>
        </q-menu>
      </q-tr>
    </template>
  </q-table>
</q-page>
</template>

<script>
export default {
  name: 'PageDuelsView',
  data() {
    return {
      duels: [],
      filter: '',
      pagination: {
        page: 1,
        // eslint-disable-next-line no-restricted-globals
        rowsPerPage: Math.min(Math.max(Math.floor((screen.availHeight - 200) / 50), 6), 26) - 1,
      },
      columns: [
        {
          name: 'server',
          label: this.$t('duels_view_col_server_label'),
          field: 'server',
        },
        {
          name: 'isChallenge',
          label: this.$t('duels_view_col_isChallenge_label'),
          field: (row) => row.data.isChallenge,
          format: (value) => this.$t(`duels_view_col_isChallenge_value_${value}`),
        },
        {
          name: 'isGuildDuel',
          label: this.$t('duels_view_col_isGuildDuel_label'),
          field: (row) => row.data.isGuildDuel,
          format: (value) => this.$t(`duels_view_col_isGuildDuel_value_${value}`),
        },
        {
          name: 'winnerId',
          label: this.$t('duels_view_col_winnerId_label'),
          field: (row) => row.data.winner.id,
        },
        {
          name: 'winnerName',
          label: this.$t('duels_view_col_winnerName_label'),
          field: (row) => row.data.winner.name,
        },
        {
          name: 'winnerTag',
          label: this.$t('duels_view_col_winnerTag_label'),
          field: (row) => row.data.winner.tag,
          format: (value) => {
            if (value == null || value === '') {
              return this.$t('duels_view_col_winnerTag_value_empty');
            }
            return value;
          },
        },
        {
          name: 'winnerCastle',
          label: this.$t('duels_view_col_winnerCastle_label'),
          field: (row) => row.data.winner.castle,
        },
        {
          name: 'winnerLevel',
          label: this.$t('duels_view_col_winnerLevel_label'),
          field: (row) => row.data.winner.level,
        },
        {
          name: 'winnerHp',
          label: this.$t('duels_view_col_winnerHp_label'),
          field: (row) => row.data.winner.hp,
        },
        {
          name: 'loserId',
          label: this.$t('duels_view_col_loserId_label'),
          field: (row) => row.data.loser.id,
        },
        {
          name: 'loserName',
          label: this.$t('duels_view_col_loserName_label'),
          field: (row) => row.data.loser.name,
        },
        {
          name: 'loserTag',
          label: this.$t('duels_view_col_loserTag_label'),
          field: (row) => row.data.loser.tag,
          format: (value) => {
            if (value == null || value === '') {
              return this.$t('duels_view_col_loserTag_value_empty');
            }
            return value;
          },
        },
        {
          name: 'loserCastle',
          label: this.$t('duels_view_col_loserCastle_label'),
          field: (row) => row.data.loser.castle,
        },
        {
          name: 'loserLevel',
          label: this.$t('duels_view_col_loserLevel_label'),
          field: (row) => row.data.loser.level,
        },
        {
          name: 'loserHp',
          label: this.$t('duels_view_col_loserHp_label'),
          field: (row) => row.data.loser.hp,
        },
      ],
    };
  },
  mounted() {
    import('../contentCache.js').then((contentCache) => {
      const {
        duels,
      } = contentCache;
      this.duels = duels;
    });
  },
  methods: {
    viewFightWinner(event, row) {
      this.$router.push(`/playerhistory/${row.server}/${row.data.winner.id}`);
    },
    viewFightWinnerGuild(event, row) {
      this.$router.push(`/guildmembers/${row.server}/${row.data.winner.tag}`);
    },
    viewFightLoser(event, row) {
      this.$router.push(`/playerhistory/${row.server}/${row.data.loser.id}`);
    },
    viewFightLoserGuild(event, row) {
      this.$router.push(`/guildmembers/${row.server}/${row.data.loser.tag}`);
    },
  },
};

</script>
