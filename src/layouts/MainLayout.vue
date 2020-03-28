
<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          {{ $t('app_name')}}
        </q-toolbar-title>
        <q-btn
        flat
        v-for="ws in websockets" v-bind:key="ws"
        :label="$t('ws_disconnected_want_reconnect', ws)"
        :loading="ws.isConnecting"
        @click="reconnectWebsocket(ws)"
        >
        </q-btn>
        <q-btn-dropdown v-if="login">
          <template v-slot:label>
            <a>{{ login.first_name }}</a>
            <q-img
              v-if="login.photo_url"
              :src="login.photo_url"
              :alt="`${login.first_name}${login.last_name ? ` ${login.last_name}` : ''}`"
              :title="`${login.first_name}${login.last_name ? ` ${login.last_name}` : ''}`"
              width="50px"
              height="50px"
            >
            </q-img>
          </template>
          <q-list>
            <q-item clickable v-close-popup @click="clickLogoutButton">
              <a>{{ $t('logout_btn_txt') }}</a>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <div v-else>{{ $t('game_name') }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :content-class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-1'"
    >
      <q-list>
        <q-item-label
          header
          :class="$q.dark.isActive ? 'text-gray-1' : 'text-grey-8'"
        >
          {{ $t('navigation_description') }}
        </q-item-label>
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',

  components: {
    EssentialLink: () => import('components/EssentialLink.vue'),
  },

  data() {
    return {
      leftDrawerOpen: false,
      essentialLinks: [
        {
          section: 'home',
          destination: '/',
          icon: 'home',
        },
        {
          section: 'duels',
          destination: '/duels',
          icon: 'assistant_photo',
        },
        {
          section: 'offers',
          destination: '/offers',
          icon: 'money',
        },
        {
          section: 'deals',
          destination: '/deals',
          icon: 'attach_money',
        },
        {
          section: 'guilds',
          destination: '/guilds',
          icon: 'remove_red_eye',
        },
        {
          section: 'players',
          destination: '/players',
          icon: 'remove_red_eye',
        },
      ],
      websockets: [],
      // eslint-disable-next-line max-len
      /** @type {null | {id:number;first_name:string;last_name?:string;username?:string;photo_url?:string;}} */
      login: null,
    };
  },
  mounted() {
    this.$q.dark.set(true);
    this.updateWebsockets();
    // eslint-disable-next-line no-multi-assign
    const forceUpdate = this.forceUpdate = () => this.updateWebsockets();
    import('../contentCache.js').then((contentCache) => {
      const {
        activeWebsockets,
        getTelegramUserDetails,
      } = contentCache;
      for (const ws of activeWebsockets) {
        ws.addEventListener('open', forceUpdate);
        ws.addEventListener('close', forceUpdate);
      }
      this.updateWebsockets();
      getTelegramUserDetails().then((data) => {
        this.login = data;
      }, (error) => {
        console.warn(error);
      });
    });
  },
  methods: {
    reconnectWebsocket(ws) {
      ws.ws.connect();
      this.forceUpdate();
    },
    updateWebsockets() {
      import('../contentCache.js').then((contentCache) => {
        const {
          activeWebsockets,
        } = contentCache;
        this.websockets = activeWebsockets.filter((ws) => ws.isClosed)
          .map((ws) => ({
            isConnecting: ws.isConnecting,
            isClosed: ws.isClosed,
            name: ws.name,
            ws,
          }));
      });
    },
    clickLogoutButton() {
      localStorage.removeItem('telegramUserToken');
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    },
  },
};
</script>
