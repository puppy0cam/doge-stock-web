<template>
<q-page>
  <q-table :data="offers" :columns="columns" flat :filter="filter">
    <template v-slot:top>
      <q-space />
      <q-input
      borderless
      dense
      debounce="300"
      color="primary"
      v-model="filter"
      :label="$t('offers_view_search_box_label')">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
  </q-table>
</q-page>
</template>

<script>
import { offers } from '../contentCache';

export default {
  name: 'PageOffersView',
  data() {
    return {
      offers,
      filter: '',
      columns: [
        {
          name: 'server',
          label: this.$t('offers_view_col_server_label'),
          field: 'server',
          required: true,
          align: 'left',
        },
        {
          name: 'sellerId',
          label: this.$t('offers_view_col_sellerId_label'),
          field: (row) => row.data.sellerId,
        },
        {
          name: 'sellerCastle',
          label: this.$t('offers_view_col_sellerCastle_label'),
          field: (row) => row.data.sellerCastle,
        },
        {
          name: 'sellerName',
          label: this.$t('offers_view_col_sellerName_label'),
          field: (row) => row.data.sellerName,
        },
        {
          name: 'item',
          label: this.$t('offers_view_col_item_label'),
          field: (row) => row.data.item,
        },
        {
          name: 'qty',
          label: this.$t('offers_view_col_qty_label'),
          field: (row) => row.data.qty,
        },
        {
          name: 'price',
          label: this.$t('offers_view_col_price_label'),
          field: (row) => row.data.price,
        },
      ],
    };
  },
};

</script>
