
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/Index.vue') },
      { path: 'duels', component: () => import('../pages/DuelsView.vue') },
      { path: 'offers', component: () => import('../pages/OffersView.vue') },
      { path: 'deals', component: () => import('../pages/DealsView.vue') },
      { path: 'guilds', component: () => import('../pages/GuildList.vue') },
      { path: 'players', component: () => import('../pages/PlayerList.vue') },
      { path: 'guildmembers/:server/:tag', component: () => import('../pages/GuildMembers.vue'), props: true },
      { path: 'playerhistory/:server/:id', component: () => import('../pages/PlayerHistory.vue'), props: true },
      { path: 'auth/error/outdated', component: () => import('../pages/AuthOutdated.vue') },
      { path: 'auth/error/invalid', component: () => import('../pages/AuthInvalid.vue') },
      { path: 'auth/success/:token', component: () => import('../pages/AuthSuccess.vue'), props: true },
    ],
  },
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('../pages/Error404.vue'),
  });
}

export default routes;
