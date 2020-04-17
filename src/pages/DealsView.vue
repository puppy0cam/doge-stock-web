<template>
<q-page>
  <q-table :data="deals" :columns="columns" flat :filter="filter" :pagination.sync="pagination">
    <template v-slot:top>
      <q-space />
      <q-input borderless
      dense debounce="300"
      color="primary"
      v-model="filter"
      :label="$t('deals_view_search_bar_label')"
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
          <q-item clickable @click="viewSeller($event, props.row)">
            <q-item-section>{{ $t('deals_table_option_view_selling_player') }}</q-item-section>
          </q-item>
          <q-item clickable @click="viewBuyer($event, props.row)">
            <q-item-section>{{ $t('deals_table_option_view_buying_player') }}</q-item-section>
          </q-item>
        </q-menu>
      </q-tr>
    </template>
  </q-table>
</q-page>
</template>

<script>
export default {
  name: 'PageDealsView',
  data() {
    return {
      deals: [],
      filter: '',
      pagination: {
        page: 1,
        // eslint-disable-next-line no-restricted-globals
        rowsPerPage: Math.min(Math.max(Math.floor((screen.availHeight - 200) / 50), 6), 26) - 1,
      },
      columns: [
        {
          name: 'server',
          label: this.$t('deals_view_col_server_label'),
          field: 'server',
          required: true,
          align: 'left',
        },
        {
          name: 'sellerCastle',
          label: this.$t('deals_view_col_sellerCastle_label'),
          field: (row) => row.data.sellerCastle,
        },
        {
          name: 'sellerName',
          label: this.$t('deals_view_col_sellerName_label'),
          field: (row) => row.data.sellerName,
        },
        {
          name: 'buyerCastle',
          label: this.$t('deals_view_col_buyerCastle_label'),
          field: (row) => row.data.buyerCastle,
        },
        {
          name: 'buyerName',
          label: this.$t('deals_view_col_buyerName_label'),
          field: (row) => row.data.buyerName,
        },
        {
          name: 'item',
          label: this.$t('deals_view_col_item_label'),
          field: (row) => row.data.item,
        },
        {
          name: 'qty',
          label: this.$t('deals_view_col_qty_label'),
          field: (row) => row.data.qty,
        },
        {
          name: 'price',
          label: this.$t('deals_view_col_price_label'),
          field: (row) => row.data.price,
        },
      ],
    };
  },
  mounted() {
    import('../contentCache.js').then((contentCache) => {
      const {
        deals,
      } = contentCache;
      this.deals = deals;
    });
  },
  methods: {
    viewSeller(event, row) {
      this.$router.push(`/playerhistory/${row.server}/${row.data.sellerId}`);
    },
    viewBuyer(event, row) {
      this.$router.push(`/playerhistory/${row.server}/${row.data.buyerId}`);
    },
  },
};

</script>
