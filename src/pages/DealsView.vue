<template>
<q-page>
  <q-table :data="deals" :columns="columns" flat :filter="filter">
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
      columns: [
        {
          name: 'server',
          label: this.$t('deals_view_col_server_label'),
          field: 'server',
          required: true,
          align: 'left',
        },
        {
          name: 'sellerId',
          label: this.$t('deals_view_col_sellerId_label'),
          field: (row) => row.data.sellerId,
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
          name: 'buyerId',
          label: this.$t('deals_view_col_buyerId_label'),
          field: (row) => row.data.buyerId,
        },
        {
          name: 'buyerCastle',
          label: this.$t('deals_view_col_buyerCastle_label'),
          field: (row) => row.data.buyercastle,
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
};

</script>
