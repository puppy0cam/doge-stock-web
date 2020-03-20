
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

        <div>{{ $t('game_name') }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
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
import EssentialLink from 'components/EssentialLink';
import { activeWebsockets } from '../contentCache';

export default {
  name: 'MainLayout',

  components: {
    EssentialLink,
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
    };
  },
  mounted() {
    this.updateWebsockets();
    // eslint-disable-next-line no-multi-assign
    const forceUpdate = this.forceUpdate = () => this.updateWebsockets();
    for (const ws of activeWebsockets) {
      ws.addEventListener('open', forceUpdate);
      ws.addEventListener('close', forceUpdate);
    }
  },
  methods: {
    reconnectWebsocket(ws) {
      ws.ws.connect();
      this.forceUpdate();
    },
    updateWebsockets() {
      this.websockets = activeWebsockets.filter((ws) => ws.isConnecting || ws.isClosed)
        .map((ws) => ({
          isConnecting: ws.isConnecting,
          isClosed: ws.isClosed,
          name: ws.name,
          ws,
        }));
    },
  },
};
function onTelegramAuth(user) {
  console.debug(user);
}
window.onTelegramAuth = onTelegramAuth;
</script>
