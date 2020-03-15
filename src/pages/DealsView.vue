<template>
<q-page>
  <q-table :data="deals" :columns="columns" flat :filter="filter">
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
import { deals } from '../contentCache';

export default {
  name: 'PageDealsView',
  data() {
    return {
      deals,
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
          name: 'sellerId',
          label: 'Seller ID',
          field: (row) => row.data.sellerId,
        },
        {
          name: 'sellerCastle',
          label: 'Seller Castle',
          field: (row) => row.data.sellerCastle,
        },
        {
          name: 'sellerName',
          label: 'Seller Name',
          field: (row) => row.data.sellerName,
        },
        {
          name: 'buyerId',
          label: 'Buyer ID',
          field: (row) => row.data.buyerId,
        },
        {
          name: 'buyerCastle',
          label: 'Buyer Castle',
          field: (row) => row.data.buyercastle,
        },
        {
          name: 'buyerName',
          label: 'Buyer Name',
          field: (row) => row.data.buyerName,
        },
        {
          name: 'item',
          label: 'Item',
          field: (row) => row.data.item,
        },
        {
          name: 'qty',
          label: 'Quantity',
          field: (row) => row.data.qty,
        },
        {
          name: 'price',
          label: 'Price',
          field: (row) => row.data.price,
        },
      ],
    };
  },
};

</script>
