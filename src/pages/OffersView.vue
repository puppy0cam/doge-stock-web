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
          <q-item
          v-if="authorised && getItemCode(props.row.item)"
          clickable
          @click="purchaseItem($event, props.row)">
            <q-item-section>{{ $t('offers_table_option_purchase_item') }}</q-item-section>
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
        getTelegramUserDetails,
      } = contentCache;
      this.offers = offers;
      getTelegramUserDetails().then((details) => {
        if (details) {
          this.authorised = details;
        }
      });
    });
  },
  methods: {
    clickOfferRow(event, row) {
      this.$router.push(`/playerhistory/${row.server}/${row.data.sellerId}`);
    },
    purchaseItem(event, row) {
      import('../contentCache.js').then((contentcache) => {
        const {
          wantToBuy,
        } = contentcache;
        wantToBuy(row.server, this.getItemCode(row.data.item), row.data.qty, row.data.price, true);
      });
    },
    getItemCode(item) {
      switch (item) {
        case 'Thread': return '01';
        case 'Stick': return '02';
        case 'Pelt': return '03';
        case 'Bone': return '04';
        case 'Coal': return '05';
        case 'Charcoal': return '06';
        case 'Powder': return '07';
        case 'Iron ore': return '08';
        case 'Cloth': return '09';
        case 'Silver ore': return '10';
        case 'Bauxite': return '11';
        case 'Magic stone': return '13';
        case 'Sapphire': return '15';
        case 'Solvent': return '16';
        case 'Ruby': return '17';
        case 'Hardener': return '18';
        case 'Steel': return '19';
        case 'Leather': return '20';
        case 'Bone powder': return '21';
        case 'String': return '22';
        case 'Coke': return '23';
        case 'Rope': return '31';
        case 'Metal plate': return '33';
        case 'Metallic fiber': return '34';
        case 'Crafted leather': return '35';
        case 'Stinky Sumac': return '39';
        case 'Mercy Sassafras': return '40';
        case 'Cliff Rue': return '41';
        case 'Love Creeper': return '42';
        case 'Wolf Root': return '43';
        case 'Swamp Lavender': return '44';
        case 'White Blossom': return '45';
        case 'Ilaves': return '46';
        case 'Ephijora': return '47';
        case 'Storm Hyssop': return '48';
        case 'Cave Garlic': return '49';
        case 'Yellow Seed': return '50';
        case 'Tecceagrass': return '51';
        case 'Spring Bay Leaf': return '52';
        case 'Ash Rosemary': return '53';
        case 'Sanguine Parsley': return '54';
        case 'Sun Tarragon': return '55';
        case 'Maccunut': return '56';
        case 'Dragon Seed': return '57';
        case 'Queen\'s Pepper': return '58';
        case 'Plasma of abyss': return '59';
        case 'Ultramarine dust': return '60';
        case 'Ethereal bone': return '61';
        case 'Itacory': return '62';
        case 'Assassin Vine': return '63';
        case 'Kloliarway': return '64';
        case 'Astrulic': return '65';
        case 'Flammia Nut': return '66';
        case 'Plexisop': return '67';
        case 'Mammoth Dill': return '68';
        case 'Silver dust': return '69';
        case 'Vial of Rage': return 'p01';
        case 'Potion of Rage': return 'p02';
        case 'Bottle of Rage': return 'p03';
        case 'Vial of Peace': return 'p04';
        case 'Potion of Peace': return 'p05';
        case 'Bottle of Peace': return 'p06';
        case 'Vial of Greed': return 'p07';
        case 'Potion of Greed': return 'p08';
        case 'Bottle of Greed': return 'p09';
        case 'Vial of Nature': return 'p10';
        case 'Potion of Nature': return 'p11';
        case 'Bottle of Nature': return 'p12';
        case 'Vial of Mana': return 'p13';
        case 'Potion of Mana': return 'p14';
        case 'Bottle of Mana': return 'p15';
        case 'Vial of Twilight': return 'p16';
        case 'Potion of Twilight': return 'p17';
        case 'Bottle of Twilight': return 'p18';
        case 'Vial of Morph': return 'p19';
        case 'Potion of Morph': return 'p20';
        case 'Bottle of Morph': return 'p21';
        default: return '';
      }
    },
  },
};

</script>
