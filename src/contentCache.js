/* eslint-disable operator-linebreak */
/* eslint-disable no-restricted-globals */
/* eslint-disable max-len */

/** @type {{server:"eucw"|"ru";data:{item:string;qty:number;price:number;sellerId:string;sellerName:string;sellerCastle:string;buyerId:string;buyerName:string;buyerCastle:string;}}[]} */
export const deals = [];
/** @type {{server:"eucw"|"ru";data:{item:string;qty:number;price:number;sellerId:string;sellerName:string;sellerCastle:string;};pricing:null|{avg:number;min:number;max:number;};}[]} */
export const offers = [];
/** @type {{server:"eucw"|"ru";data:{isChallenge:boolean;isGuildDuel:boolean;winner:{id:string;name:string;tag?:string;castle:string;level:number;hp:number;};loser:{id:string;name:string;tag?:string;castle:string;level:number;hp:number;};}}[]} */
export const duels = [];
/** @type {{[key in "eucw"|"ru"]:{[itemName: string]:{min:number;max:number;avg:number;};};}} */
export const stockExchangeStatus = {
  eucw: {},
  ru: {},
};
/**
 * @returns {null | {min:number;max:number;avg:number;}}
 * @param {'eucw'|'ru'} server
 * @param {string} itemName
 */
export function getItemStockValue(server, itemName) {
  const serverInstance = stockExchangeStatus[server];
  if (serverInstance) {
    const itemInstance = serverInstance[itemName];
    if (itemInstance) {
      return itemInstance;
    }
  }
  return null;
}
class ActiveWebsocket extends EventTarget {
  /**
   * @param {string} name
   * @param {string} url
   */
  constructor(name, url) {
    super();
    this.isConnecting = false;
    this.isClosed = true;
    this.firstConnection = true;
    this.name = name;
    this.url = url;
    /** @type {WebSocket | null} */
    this.ws = null;
    this.eventDispatcher = (ev) => this.dispatchEvent(new ev.constructor(ev.type, ev));
  }

  connect() {
    if (this.isConnecting) {
      throw new Error('Already connecting');
    }
    if (!this.isClosed) {
      throw new Error('Already connected');
    }
    // eslint-disable-next-line no-multi-assign
    const ws = this.ws = new WebSocket(this.url);
    this.isConnecting = true;
    this.isClosed = false;
    ws.addEventListener('open', (ev) => {
      if (this.firstConnection) {
        this.firstConnection = false;
        ws.send('{"action":"getHistory","extra":"firstConnection"}');
      }
      this.isClosed = false;
      this.isConnecting = false;
      console.debug('WebSocket connection to %s opened', this.url, ev);
      if (!this.eventDispatcher(ev)) {
        ev.preventDefault();
      }
    });
    ws.addEventListener('close', (ev) => {
      this.isClosed = true;
      this.isConnecting = false;
      console.debug('WebSocket connection to %s closed', this.url, ev);
      if (this.eventDispatcher(ev)) {
        // this.connect();
      } else {
        ev.preventDefault();
      }
    });
    ws.addEventListener('error', (ev) => {
      console.error('WebSocket connection to %s errored', this.url, ev);
      this.eventDispatcher(ev);
    });
    ws.addEventListener('message', (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.action === 'getHistory' && data.ok) {
          console.debug('Getting %s items from history', data.payload.count);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        if (!this.eventDispatcher(ev)) {
          ev.preventDefault();
        }
      }
    });
  }
}
/** @param {string} token */
export async function registerUserToken(token) {
  localStorage.setItem('telegramUserToken', token);
}
function sortTimestamp(a, b) {
  if (a.timestamp && b.timestamp) {
    return a.timestamp.valueOf() - b.timestamp.valueOf();
  }
  return 0;
}
/** @type {ActiveWebsocket[]} */
export const activeWebsockets = [];
for (const server of ['eucw', 'ru']) {
  switch (server) {
    default:
      // eslint-disable-next-line no-continue
      continue;
    case 'eucw':
    case 'ru':
  }
  const duelsWebsocket = new ActiveWebsocket(`${server} duels`, `wss://doge-stock.com/${server}/duels`);
  activeWebsockets.push(duelsWebsocket);
  duelsWebsocket.addEventListener('message', (message) => {
    const data = JSON.parse(message.data);
    if (data.action) return;
    duels.push({
      server,
      data: data.content,
      timestamp: new Date(data.timestamp_in_ms || data.timestamp * 1000),
    });
    duels.sort(sortTimestamp);
  });
  duelsWebsocket.connect();
  const dealsWebsocket = new ActiveWebsocket(`${server} deals`, `wss://doge-stock.com/${server}/deals`);
  activeWebsockets.push(dealsWebsocket);
  dealsWebsocket.addEventListener('message', (message) => {
    const data = JSON.parse(message.data);
    if (data.action) return;
    deals.push({
      server,
      data: data.content,
      timestamp: new Date(data.timestamp_in_ms || data.timestamp * 1000),
    });
    deals.sort(sortTimestamp);
  });
  dealsWebsocket.connect();
  const offersWebsocket = new ActiveWebsocket(`${server} offers`, `wss://doge-stock.com/${server}/offers`);
  activeWebsockets.push(offersWebsocket);
  offersWebsocket.addEventListener('message', (message) => {
    const data = JSON.parse(message.data);
    if (data.action) return;
    offers.push({
      server,
      data: data.content,
      timestamp: new Date(data.timestamp_in_ms || data.timestamp * 1000),
      pricing: getItemStockValue(server, data.content.item),
    });
    offers.sort(sortTimestamp);
  });
  offersWebsocket.connect();
  const stockExchangeDigestWebsocket = new ActiveWebsocket(`${server} Stock Prices`, `wss://doge-stock.com/${server}/sex_digest`);
  activeWebsockets.push(stockExchangeDigestWebsocket);
  stockExchangeDigestWebsocket.addEventListener('message', (message) => {
    const data = JSON.parse(message.data);
    if (data.action) return;
    const serverInstance = stockExchangeStatus[server];
    for (const {
      name: itemName,
      prices,
    } of data.content) {
      // eslint-disable-next-line no-multi-assign
      const item = serverInstance[itemName] = {
        avg: NaN,
        min: Infinity,
        max: -Infinity,
      };
      let min = Infinity;
      let max = -Infinity;
      let total = 0;
      for (const i of prices) {
        if (i > max) {
          max = i;
        }
        if (i < min) {
          min = i;
        }
        total += i;
      }
      item.min = min;
      item.max = max;
      item.avg = Math.round((total / prices.length) * 100) / 100;
    }
  });
  stockExchangeDigestWebsocket.connect();
}
async function sendRequest(url) {
  const response = await fetch(url);
  // eslint-disable-next-line no-return-await
  return await sendRequest.toJson(response);
}
sendRequest.toJson =
/** @param {Response} data */
async function toJson(data) {
  if (data.status === 200) {
    // eslint-disable-next-line no-return-await
    return await data.json();
  }
  throw new Error(`Status code ${data.status}`);
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
  const result = {
    castle: value.castle,
    guild_tag: value.guild_tag,
    name: value.name,
    timestamp: new Date(value.timestamp),
  };
  if (result.timestamp.valueOf() < 9999999999) {
    result.timestamp.setTime(result.timestamp.valueOf() * 1000);
  }
  return result;
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
  const result = {
    castle: value.castle,
    guild_tag: value.guild_tag,
    name: value.name,
    timestamp: new Date(value.timestamp),
  };
  if (result.timestamp.valueOf() < 9999999999) {
    result.timestamp.setTime(result.timestamp.valueOf() * 1000);
  }
  return result;
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
/** @returns {Promise<{id:number;first_name:string;last_name?:string;username?:string;photo_url?:string;}>} */
export async function getTelegramUserDetails() {
  const storageKey = localStorage.getItem('telegramUserToken');
  if (storageKey === null) {
    return null;
  }
  if (getTelegramUserDetails.cache) {
    return {
      ...getTelegramUserDetails.cache,
    };
  }
  getTelegramUserDetails.cache = await sendRequest(`/auth/telegram/check?token=${storageKey}`);
  return {
    ...getTelegramUserDetails.cache,
  };
}
/**
 * @param {string} server
 * @param {string} itemCode
 * @param {number} quantity
 * @param {number} price
 * @param {boolean=} exactPrice
 */
export async function wantToBuy(server, itemCode, quantity, price, exactPrice) {
  return sendRequest(`/exchange/wtb?server=${server}&token=${localStorage.getItem('telegramUserToken')}&itemCode=${itemCode}&quantity=${quantity}&price=${price}&exactPrice=${Boolean(exactPrice)}`);
}
