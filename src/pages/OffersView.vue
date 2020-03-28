<template>
<q-page>
  <q-table
  :data="offers"
  :columns="columns"
  flat
  :filter="filter"
  @row-click="clickOfferRow"
  >
    <template v-slot:top>
      <q-space />
      <q-input
      borderless
      dense
      debounce="300"
      color="primary"
      v-model="filter"
      :label="$t('offers_view_search_box_label')"
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
          <q-item clickable @click="clickOfferRow($event, props.row)">
            <q-item-section>{{ $t('offers_table_option_view_selling_player') }}</q-item-section>
          </q-item>
        </q-menu>
      </q-tr>
    </template>
  </q-table>
</q-page>
</template>

<script>
export default {
  name: 'PageOffersView',
  data() {
    return {
      offers: [],
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
  mounted() {
    import('../contentCache.js').then((contentCache) => {
      const {
        offers,
      } = contentCache;
      this.offers = offers;
    });
  },
  methods: {
    clickOfferRow(event, row) {
      this.$router.push(`/playerhistory/${row.server}/${row.data.sellerId}`);
    },
  },
};

</script>
