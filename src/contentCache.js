/* eslint-disable operator-linebreak */
/* eslint-disable no-restricted-globals */
/* eslint-disable max-len */

/** @type {{server:"eucw"|"ru";data:{item:string;qty:number;price:number;sellerId:string;sellerName:string;sellerCastle:string;buyerId:string;buyerName:string;buyerCastle:string;}}[]} */
export const deals = [];
/** @type {{server:"eucw"|"ru";data:{item:string;qty:number;price:number;sellerId:string;sellerName:string;sellerCastle:string;}}[]} */
export const offers = [];
/** @type {{server:"eucw"|"ru";data:{isChallenge:boolean;isGuildDuel:boolean;winner:{id:string;name:string;tag?:string;castle:string;level:number;hp:number;};loser:{id:string;name:string;tag?:string;castle:string;level:number;hp:number;};}}[]} */
export const duels = [];

let websocketPrefix;
if (location.protocol === 'https:') {
  websocketPrefix = 'wss://';
} else {
  websocketPrefix = 'ws://';
}
for (const server of ['eucw', 'ru']) {
  const duelsWebsocket = new WebSocket(`${websocketPrefix}${location.hostname}/${server}/duels`);
  duelsWebsocket.addEventListener('close', (ev) => {
    console.log('%s duels connection closed', server, ev);
  });
  duelsWebsocket.addEventListener('error', (ev) => {
    console.error('%s duels connection error', server, ev);
  });
  duelsWebsocket.addEventListener('open', (ev) => {
    console.log('%s duels connection open', server, ev);
  });
  duelsWebsocket.addEventListener('message', (message) => {
    message.data.text().then(JSON.parse).then((data) => {
      duels.push({
        server,
        data,
      });
    }).catch((error) => {
      console.error('%s duels failed to be parsed', server, message, error);
    });
  });
  const dealsWebsocket = new WebSocket(`${websocketPrefix}${location.hostname}/${server}/deals`);
  dealsWebsocket.addEventListener('close', (ev) => {
    console.log('%s deals connection closed', server, ev);
  });
  dealsWebsocket.addEventListener('error', (ev) => {
    console.error('%s deals connection error', server, ev);
  });
  dealsWebsocket.addEventListener('open', (ev) => {
    console.log('%s deals connection open', server, ev);
  });
  dealsWebsocket.addEventListener('message', (message) => {
    message.data.text().then(JSON.parse).then((data) => {
      deals.push({
        server,
        data,
      });
    }).catch((error) => {
      console.error('%s deals failed to be parsed', server, message, error);
    });
  });
  const offersWebsocket = new WebSocket(`${websocketPrefix}${location.hostname}/${server}/offers`);
  offersWebsocket.addEventListener('close', (ev) => {
    console.log('%s offers connection closed', server, ev);
  });
  offersWebsocket.addEventListener('error', (ev) => {
    console.error('%s offers connection error', server, ev);
  });
  offersWebsocket.addEventListener('open', (ev) => {
    console.log('%s offers connection open', server, ev);
  });
  offersWebsocket.addEventListener('message', (message) => {
    message.data.text().then(JSON.parse).then((data) => {
      offers.push({
        server,
        data,
      });
    }).catch((error) => {
      console.error('%s offers failed to be parsed', server, message, error);
    });
  });
}
function sendRequest(url) {
  return fetch(url).then(sendRequest.toJson);
}
sendRequest.toJson =
/** @param {Response} data */
function toJson(data) {
  return data.json();
};
/**
 * @param {"eucw"|"ru"} server
 * @param {string} id
 */
export async function getPlayerSpaiHistory(server, id) {
  /** @type {{schemaVersion:string;data:{name:string;castle:string;guild_tag:string|null;timestamp:number;}[]}} */
  const result = await sendRequest(`/spai/player/history?server=${server}&id=${id}`);
  if (result.schemaVersion !== '1.0.0') {
    throw new Error('Schema is out of date');
  }
  return result.data.map(getPlayerSpaiHistory.mapValue);
}
getPlayerSpaiHistory.mapValue =
/** @param {{name:string;castle:string;guild_tag:string|null;timestamp:number;}} value */
function mapValue(value) {
  return {
    castle: value.castle,
    guild_tag: value.guild_tag,
    name: value.name,
    timestamp: new Date(value.timestamp * 1000),
  };
};
/**
 * @param {"eucw"|"ru"} server
 * @param {string} name
 */
export async function findSpaiPlayer(server, name) {
  /** @type {{schemaVersion:string;data:{name:string;castle:string;guild_tag:string|null;timestamp:number;}[]}} */
  const result = await sendRequest(`/spai/player/find?server=${server}&name=${name}`);
  if (result.schemaVersion !== '1.0.0') {
    throw new Error('Schema is out of date');
  }
  return result.data.map(findSpaiPlayer.mapValue);
}
findSpaiPlayer.mapValue =
/** @param {{name:string;castle:string;guild_tag:string|null;timestamp:number;}} value */
function mapValue(value) {
  return {
    castle: value.castle,
    guild_tag: value.guild_tag,
    name: value.name,
    timestamp: new Date(value.timestamp * 1000),
  };
};
/**
 * @param {"eucw"|"ru"} server
 * @param {string} tag
 * @returns {Promise<undefined | {tag:string;castle:string;}>}
 */
export async function findSpaiGuild(server, tag) {
  /** @type {{schemaVersion:string;data:{tag:string;castle:string;}[]}} */
  const result = await sendRequest(`/spai/guild?server=${server}&tag=${tag}`);
  if (result.schemaVersion !== '1.0.0') {
    throw new Error('Schema is out of date');
  }
  return result.data.map(findSpaiGuild.mapValue)[0];
}
findSpaiGuild.mapValue =
/** @param {{tag:string;castle:string;}} value */
function mapValue(value) {
  return {
    tag: value.tag,
    castle: value.castle,
  };
};
/**
 * @param {"eucw"|"ru"} server
 * @param {string} tag
 */
export async function getGuildMembers(server, tag) {
  /** @type {{schemaVersion:string;data:{cwid:string;ign:string;castle:string;}[]}} */
  const result = await sendRequest(`/spai/guild/members?server=${server}&tag=${tag}`);
  if (result.schemaVersion !== '1.0.0') {
    throw new Error('Schema is out of date');
  }
  return result.data.map(getGuildMembers.mapValue);
}
getGuildMembers.mapValue =
/** @param {{cwid:string;ign:string;castle:string;}} value */
function mapValue(value) {
  return {
    cwid: value.cwid,
    ign: value.ign,
    castle: value.castle,
  };
};
/** @param {"eucw"|"ru"} server */
export async function getAllGuilds(server) {
  const now = Date.now();
  if (getAllGuilds.cache.has(server)) {
    const cache = getAllGuilds.cache.get(server);
    if (now < cache.expires) {
      return cache.data.map(getAllGuilds.mapValue);
    }
  }
  /** @type {{schemaVersion:string;data:{tag:string;castle:string;}[];}} */
  const result = await sendRequest(`/spai/guild/all?server=${server}`);
  if (result.schemaVersion !== '1.0.0') {
    throw new Error('Schema is out of date');
  }
  getAllGuilds.cache.set(server, {
    data: result.data,
    expires: Date.now() + 300000,
  });
  return result.data.map(getAllGuilds.mapValue);
}
getAllGuilds.mapValue =
/** @param {{tag:string;castle:string:}} value */
function mapValue(value) {
  return {
    tag: value.tag,
    castle: value.castle,
  };
};
/** @type {Map<string, {expires:number;data:{tag:string;castle:string;}[]}} */
getAllGuilds.cache = new Map();
/** @param {"eucw"|"ru"} server */
export async function getAllPlayers(server) {
  const now = Date.now();
  if (getAllPlayers.cache.has(server)) {
    const cache = getAllPlayers.cache.get(server);
    if (now < cache.expires) {
      return cache.data.map(getAllPlayers.mapValue);
    }
  }
  /** @type {{schemaVersion:string;data:{cwid:string;ign:string;castle:string;guild_tag:string|null;}[];}} */
  const result = await sendRequest(`/spai/player/all?server=${server}`);
  if (result.schemaVersion !== '1.0.0') {
    throw new Error('Schema is out of date');
  }
  getAllPlayers.cache.set(server, {
    data: result.data,
    expires: Date.now() + 300000,
  });
  return result.data.map(getAllPlayers.mapValue);
}
getAllPlayers.mapValue =
/** @param {{cwid:string;ign:string;castle:string;guild_tag:string|null;}} value */
function mapValue(value) {
  return {
    cwid: value.cwid,
    ign: value.ign,
    castle: value.castle,
    guild_tag: value.guild_tag,
  };
};
/** @type {Map<string, {expires:number;data:{cwid:string;ign:string;castle:string;guild_tag:string|null;}[]}} */
getAllPlayers.cache = new Map();

/**
 * @param {"eucw"|"ru"} server
 * @param {number} startRow
 * @param {number} fetchCount
 * @param {string} filter
 * @param {"cwid"|"castle"|"ign"|"guild_tag"} sortBy
 * @param {"asc"|"desc"} direction
 */
export async function getAllPlayersSmart(server, startRow, fetchCount, filter, sortBy, direction) {
  /** @type {{schemaVersion:string;data:{cwid:string;ign:string;castle:string;guild_tag:string|null;}[];}} */
  const result = await sendRequest(`/spai/player/all/smart?server=${server}&startRow=${startRow}&fetchCount=${fetchCount}&sortBy=${sortBy}&direction=${direction}&filter=${encodeURIComponent(filter)}`);
  if (result.schemaVersion !== '1.0.0') {
    throw new Error('Schema is out of date');
  }
  return result.data.map(getAllPlayersSmart.mapValue);
}
getAllPlayersSmart.mapValue =
/** @param {{cwid:string;ign:string;castle:string;guild_tag:string|null;}} value */
function mapValue(value) {
  return {
    cwid: value.cwid,
    ign: value.ign,
    castle: value.castle,
    guild_tag: value.guild_tag,
  };
};

/**
 * @param {"eucw"|"ru"} server
 * @param {string} filter
 */
export async function getAllPlayersCount(server, filter) {
  /** @type {{schemaVersion:string;data:number;}} */
  const result = await sendRequest(`/spai/player/count?server=${server}&filter=${filter}`);
  if (result.schemaVersion !== '1.0.1') {
    throw new Error('Schema is out of date');
  }
  return result.data;
}
