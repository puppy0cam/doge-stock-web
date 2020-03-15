/* eslint-disable camelcase */

const home_page_content = `\
# Doge Stock
Welcome to Doge Stock,
this website is still is it's early stages.
Check back later for updates!

I have exposed some API endpoints for Doge Stock in order to run this website.
While you are welcome to use the website,
please understand that I log the IP address of all requests,
and abuse could lead to your IP being blocked.

/spai/player/history?server&id

/spai/player/find?server&name

/spai/guild?server&tag

/spai/guild/members?server&tag

The \`server\` parameter expects that you specify "eucw" or "ru" (lowercase)
Other fields depend on the circumstances, and I grant no guaruntee of it being successful.

I also have websockets available running on /{server}/{queue} which mirror the queues available in the official Chat Wars API.
 - /eucw/deals
 - /eucw/offers
 - /eucw/duels
 - /eucw/sex_digest
 - /eucw/au_digest
 - /eucw/yellow_pages
 - /ru/deals
 - /ru/offers
 - /ru/duels
 - /ru/sex_digest
 - /ru/au_digest
 - /ru/yellow_pages
`;

export default {
  home_page_content,
  nav_title_duels: 'Duels',
  nav_caption_duels: 'See who wins or loses in the arena',
  nav_title_home: 'Home',
  nav_caption_home: 'Visit the Home Page',
  nav_title_offers: 'Offers',
  nav_caption_offers: 'Watch the exchange offers come in live!',
  nav_title_deals: 'Deals',
  nav_caption_deals: 'Watch the exchange deals happen live!',
  nav_title_spai: 'Spai',
  nav_caption_spai: 'Learn about the name, castle, and guild changes happening in the Chat Wars kingdoms',
  game_name: 'Chat Wars',
  navigation_description: 'Services',
  app_name: 'Doge Stock',
  spai_name: 'Spai',
  eu_name_identifier: 'Chat Wars International',
  ru_name_identifier: 'Chat Wars 3',
};
