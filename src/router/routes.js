
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'duels', component: () => import('pages/DuelsView.vue') },
      { path: 'offers', component: () => import('pages/OffersView.vue') },
      { path: 'deals', component: () => import('pages/DealsView.vue') },
      { path: 'guilds', component: () => import('pages/GuildList.vue') },
    ],
  },
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue'),
  });
}

export default routes;
