/* eslint-disable camelcase */

const home_page_content = `\
# Doge Stock
Welcome to Doge Stock,
this website is still is it's early stages.
Check back later for updates!

I have exposed some API endpoints for Doge Stock in order to run this website.
While you are welcome to use the website,
Other developers are also welcome to use this service but,
Don't abuse it or take things too far or I'll start blocking your requests.
Please take note that the webserver is intentionally placed away from the database, and queries may not be fulfilled at such a high rate.
Serverside caching is enabled for some intensive methods,
Your browser may also cache some requests for a period

 - /spai/player/history?server&id
 - /spai/player/find?server&name
 - /spai/guild?server&tag
 - /spai/guild/members?server&tag
 - /spai/guild/all?server
 - /spai/player/all?server
 - /spai/player/count?server&filter
 - /spai/player/all/smart?server&startRow&fetchCount&filter&sortBy

The \`server\` parameter expects that you specify "eucw" or "ru". Some aliases are accepted, but not guarunteed.
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

If you are a regular user and would like to translate the site into your language,
you are welcome to submit translations to my feedback or updates channel discussion group.
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
  nav_title_guilds: 'Guilds',
  nav_caption_guilds: 'View a list of all the guilds known, and view further informationa about them.',
  nav_title_players: 'Players',
  nav_caption_players: 'View a list of all players known to Chat Wars! Please be aware that EUCW may have some stray entries from cw3 and I have no idea how they got there.',
  game_name: 'Chat Wars',
  navigation_description: 'Services',
  app_name: 'Doge Stock',
  spai_name: 'Spai',
  eu_name_identifier: 'Chat Wars International',
  ru_name_identifier: 'Chat Wars 3',
  deals_view_search_bar_label: 'Search',
  deals_view_col_sellerId_label: 'Seller ID',
  deals_view_col_sellerCastle_label: 'Seller Castle',
  deals_view_col_sellerName_label: 'Seller Name',
  deals_view_col_buyerId_label: 'Buyer ID',
  deals_view_col_buyerCastle_label: 'Buyer Castle',
  deals_view_col_buyerName_label: 'Buyer Name',
  deals_view_col_item_label: 'Item',
  deals_view_col_qty_label: 'Quantity',
  deals_view_col_price_label: 'Price',
  deals_view_col_server_label: 'Server',
  duels_view_col_server_label: 'Server',
  duels_view_col_isChallenge_label: 'Is Challenge',
  duels_view_col_isGuildDuel_label: 'Is Guild Duel',
  duels_view_col_winnerId_label: 'Winner ID',
  duels_view_col_winnerName_label: 'Winner Name',
  duels_view_col_winnerTag_label: 'Winner Guild',
  duels_view_col_winnerCastle_label: 'Winner Castle',
  duels_view_col_winnerLevel_label: 'Winner Level',
  duels_view_col_winnerHp_label: 'Winner Health',
  duels_view_col_loserId_label: 'Loser ID',
  duels_view_col_loserName_label: 'Loser Name',
  duels_view_col_loserTag_label: 'Loser Guild',
  duels_view_col_loserCastle_label: 'Loser Castle',
  duels_view_col_loserLevel_label: 'Loser Level',
  duels_view_col_loserHp_label: 'Loser Health',
  duels_view_search_bar_label: 'Search',
  duels_view_col_loserTag_value_empty: '',
  duels_view_col_winnerTag_value_empty: '',
  duels_view_col_isChallenge_value_true: 'Yes',
  duels_view_col_isChallenge_value_false: 'No',
  duels_view_col_isGuildDuel_value_true: 'Yes',
  duels_view_col_isGuildDuel_value_false: 'No',
  page_404_text: 'Sorry, but this page could not be found (404)',
  page_404_home_btn_label: 'Go Back',
  guild_list_search_box_label: 'Search',
  guild_list_option_serverSelected_value_EUCW: 'EU Guilds',
  guild_list_option_serverSelected_value_RU: 'CW3 Guilds',
  guild_list_option_serverSelected_dropdown_EUCW: 'EU Guilds',
  guild_list_option_serverSelected_dropdown_RU: 'CW3 Guilds',
  guild_list_col_tag_label: 'Guild',
  guild_list_col_castle_label: 'Castle',
  guild_members_search_box_label: 'Search',
  guild_members_col_cwid_label: 'Player ID',
  guild_members_col_ign_label: 'Name',
  guild_members_col_castle_label: 'Castle',
  offers_view_search_box_label: 'Search',
  offers_view_col_server_label: 'Server',
  offers_view_col_sellerId_label: 'Seller ID',
  offers_view_col_sellerCastle_label: 'Seller Castle',
  offers_view_col_sellerName_label: 'Seller Name',
  offers_view_col_item_label: 'Item',
  offers_view_col_qty_label: 'Quantity',
  offers_view_col_price_label: 'Price',
  player_history_search_box_label: 'Search',
  player_history_col_name_label: 'Name',
  player_history_col_castle_label: 'Castle',
  player_history_col_guild_tag_label: 'Guild',
  player_history_col_timestamp_label: 'Date',
  player_list_option_serverSelected_value_EUCW: 'EU Players',
  player_list_option_serverSelected_value_RU: 'CW3 Players',
  player_list_option_serverSelected_dropdown_EUCW: 'EU Players',
  player_list_option_serverSelected_dropdown_RU: 'CW3 Players',
  player_list_search_box_label: 'Search',
  player_list_col_cwid_label: 'Player ID',
  player_list_col_castle_label: 'Castle',
  player_list_col_ign_label: 'Name',
  player_list_col_guild_tag_label: 'Guild',
  player_list_col_guild_tag_value_unknown: '',
  player_list_col_guild_tag_value_empty: 'None',
  ws_disconnected_reconnecting: 'Reconnecting {name}',
  ws_disconnected_want_reconnect: 'Reconnect to {name}',
  auth_success_header: 'Authentication Successful!',
  auth_success_waiting_text: 'Please wait a moment as we retrieve your information',
  auth_invalid_header: 'Authentication Invalid',
  auth_invalid_description: 'Unfortunately, the data sent was invalid\nWe were unable to validate your identity\nTry pressing the Sign In button again',
  auth_outdated_header: 'Out of Date',
  auth_outdated_description: 'This authentication request is out of date, and can no longer be used to authenticate you.\nPlease press the Sign In button again',
  logout_btn_txt: 'Logout',
  offers_table_option_view_selling_player: 'View Seller',
  duels_table_option_view_winning_player: 'View Winner',
  duels_table_option_view_losing_player: 'View Loser',
  duels_table_option_view_winning_guild: 'View Winner\'s guild',
  duels_table_option_view_losing_guild: 'View Loser\'s guild',
  deals_table_option_view_selling_player: 'View Seller',
  deals_table_option_view_buying_player: 'View Buyer',
};
