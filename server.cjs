/* eslint-disable no-restricted-globals */
/* eslint-disable no-labels */
/* eslint-disable no-useless-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable strict */
const uuid = require('uuid');
const {
  connect: amqpConnect,
} = require('amqplib');
const {
  Server: WebSocketServer,
} = require('ws');
const {
  createServer,
} = require('http');
const {
  parse,
} = require('url');
const {
  watchFile,
  promises: {
    stat,
    readFile,
  },
} = require('fs');
const {
  gzip,
} = require('zlib');
const {
  normalize,
  join,
  parse: parsePath,
} = require('path');
const httpsModule = require('https');
const querystring = require('querystring');
const knexModule = require('knex');
const {
  isDeepStrictEqual,
} = require('util');
const {
  createHash,
  createHmac,
} = require('crypto');
/** @type {typeof import('./credentials')} */
const {
  getConfig,
} = require('./credentials.cjs');

const playerIdRegex = /^[abcdefghijklmnopqrstuvwxyz0123456789-]+$/;
const pathSanitizer = /^(\.\.[/\\])+/;
const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'application/x-font-ttf',
};
// eslint-disable-next-line max-len
/** @type {Map<string, {id:string;first_name:string;last_name:string;username:string;photo_url:string;auth_date:string;hash:string;}>} */
const verifiedUserAuthentications = new Map();
/** @type {{server:import('ws').Server;path:string;}[]} */
const websockets = [];
/** @type {import('./credentials').Config} */
let currentConfig = null;
const configKnexInstances = new WeakMap();
function getKnexInstanceForServer(server) {
  if (!configKnexInstances.has(currentConfig)) {
    const currentInstances = new Map();
    configKnexInstances.set(currentConfig, currentInstances);
  }
  const instances = configKnexInstances.get(currentConfig);
  for (const serverConfig of currentConfig.servers) {
    if (serverConfig.trueName === server || serverConfig.aliases.includes(server)) {
      if (instances.has(serverConfig.trueName)) {
        return instances.get(serverConfig.trueName);
      }
      const knexInstance = knexModule(serverConfig.database);
      instances.set(serverConfig.trueName, knexInstance);
      return knexInstance;
    }
  }
  throw new Error('Server not found');
}
/** @type {WeakMap<import('knex'), {expires:number;data:Buffer;}} */
const spaiPlayerAllListCache = new WeakMap();
/** @type {WeakMap<import('knex'), {expires:number;data:Buffer;}} */
const spaiGuildAllListCache = new WeakMap();
// eslint-disable-next-line max-len
/** @type {Map<string, {stats:import('fs').Stats;uncompressedCache:Promise<Buffer>;gzipCompressedCache:Promise<Buffer>;}>} */
const fileSystemCache = new Map();
/**
 * @param {string} localPath
 * @param {import('http').ServerResponse} response
 * @param {"gzip"|"none"} mode
 * @param {number} browserCacheTime how many seconds the browser can hold on to this in the cache.
 * @param {string} contentType
 */
async function sendFileToBrowser(localPath, response, mode, browserCacheTime, contentType) {
  'use strict';

  /** @type {import('fs').Stats} */
  let currentStats;
  try {
    currentStats = await stat(localPath);
  } catch {
    response.writeHead(404, {
      'Content-Length': 0,
    });
    response.end();
    return;
  }
  if (!currentStats.isFile()) {
    response.writeHead(404, {
      'Content-Length': 0,
    });
    response.end();
    return;
  }
  let willCacheHit = false;
  if (fileSystemCache.has(localPath)) {
    const cache = fileSystemCache.get(localPath);
    if (isDeepStrictEqual(cache.stats, currentStats)) {
      willCacheHit = true;
    }
  }
  if (!willCacheHit) {
    console.debug('Cache was missed for %s', localPath);
    const fileRead = readFile(localPath);
    const cacheResult = {
      stats: currentStats,
      uncompressedCache: fileRead,
      gzipCompressedCache: new Promise((resolve, reject) => {
        'use strict';

        fileRead.then((content) => {
          'use strict';

          gzip(content, (error, result) => {
            'use strict';

            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        }, reject);
      }),
    };
    fileSystemCache.set(localPath, cacheResult);
  }
  const hitCache = fileSystemCache.get(localPath);
  if (mode === 'gzip') {
    hitCache.gzipCompressedCache.then((value) => {
      'use strict';

      response.writeHead(200, {
        'Content-Length': value.byteLength,
        'Cache-Control': `Public, Max-Age=${browserCacheTime}`,
        'Content-Type': contentType,
        'Content-Encoding': 'gzip',
      });
      response.write(value);
      response.end();
    });
  } else if (mode === 'none') {
    hitCache.uncompressedCache.then((value) => {
      'use strict';

      response.writeHead(200, {
        'Content-Length': value.byteLength,
        'Cache-Control': `Public, Max-Age=${browserCacheTime}`,
        'Content-Type': contentType,
      });
      response.write(value);
      response.end();
    });
  } else {
    response.writeHead(500, {
      'Content-Length': 0,
    });
    response.end();
  }
}
/** @type {WeakMap<import('./credentials').Config, Buffer[]>} */
const tokenHashes = new WeakMap();

function checkBotAuthSignature(data) {
  if (!tokenHashes.has(currentConfig)) {
    const newTokenHashes = [];
    for (const server of currentConfig.servers) {
      newTokenHashes.push(createHash('sha256').update(server.botToken).digest());
    }
    tokenHashes.set(currentConfig, newTokenHashes);
  }
  const {
    hash,
  } = data;
  const checkString = Object.keys(data)
    .filter((key) => key !== 'hash')
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');
  const tokens = tokenHashes.get(currentConfig);
  for (const token of tokens) {
    const hmac = createHmac('sha256', token)
      .update(checkString)
      .digest('hex');
    if (hmac === hash) {
      return true;
    }
  }
  return false;
}
async function onReceiveRequest(request, response) {
  'use strict';

  if (request.headers.connection === 'Upgrade') {
    return;
  }
  if (request.method.toUpperCase() !== 'GET') {
    response.writeHead(405, {
      'Content-Length': 0,
    });
    response.end();
    return;
  }
  const path = parse(request.url);
  const params = querystring.parse(path.query);
  if (path.pathname === '/spai/player/history') {
    let knex;
    try {
      knex = getKnexInstanceForServer(params.server);
    } catch {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.id == null) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (!params.id.match(playerIdRegex)) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (!knex) {
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    try {
      const data = await knex('historical_names').select('name', 'castle', 'guild_tag', 'timestamp').where('cwid', params.id);
      const dataLength = data.length;
      for (let i = 0; i < dataLength; i++) {
        const value = data[i];
        const {
          timestamp,
        } = value;
        if (timestamp != null) {
          value.timestamp = Math.floor(timestamp.valueOf() / 1000);
        }
      }
      const RESULT = Buffer.from(JSON.stringify({
        schemaVersion: '1.0.0',
        data: data || [],
      }));
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': RESULT.byteLength,
      });
      response.write(RESULT);
      response.end();
    } catch (e) {
      console.error(e);
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
    }
  } else if (path.pathname === '/spai/player/find') {
    let knex;
    try {
      knex = getKnexInstanceForServer(params.server);
    } catch {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.name == null) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (!knex) {
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    try {
      const data = await knex('historical_names').select('cwid', 'name', 'castle', 'guild_tag', 'timestamp').where('name', 'LIKE', `%${params.name}%`);
      const dataLength = data.length;
      for (let i = 0; i < dataLength; i++) {
        const value = data[i];
        const { timestamp } = value;
        if (timestamp != null) {
          value.timestamp = Math.floor(value.timestamp.valueOf() / 1000);
        }
      }
      const RESULT = Buffer.from(JSON.stringify({
        schemaVersion: '1.0.0',
        data: data || [],
      }));
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': RESULT.byteLength,
      });
      response.write(RESULT);
      response.end();
    } catch (e) {
      console.error(e);
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
    }
  } else if (path.pathname === '/spai/guild') {
    let knex;
    try {
      knex = getKnexInstanceForServer(params.server);
    } catch {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.tag == null) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (!knex) {
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    try {
      const data = await knex('spai_current_guilds').select('tag', 'castle').where('tag', params.tag);
      const RESULT = Buffer.from(JSON.stringify({
        schemaVersion: '1.0.0',
        data: data || [],
      }));
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': RESULT.byteLength,
      });
      response.write(RESULT);
      response.end();
    } catch (e) {
      console.error(e);
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
    }
  } else if (path.pathname === '/spai/guild/members') {
    let knex;
    try {
      knex = getKnexInstanceForServer(params.server);
    } catch {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.tag == null) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (!knex) {
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    try {
      const data = await knex('player_names').select('cwid', 'ign', 'castle').where('guild_tag', params.tag);
      const dataLength = data.length;
      for (let i = 0; i < dataLength; i++) {
        const value = data[i];
        const { timestamp } = value;
        if (timestamp != null) {
          value.timestamp = Math.floor(value.timestamp.valueOf() / 100);
        }
      }
      const RESULT = Buffer.from(JSON.stringify({
        schemaVersion: '1.0.0',
        data: data || [],
      }));
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': RESULT.byteLength,
      });
      response.write(RESULT);
      response.end();
    } catch (e) {
      console.error(e);
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
    }
  } else if (path.pathname === '/spai/guild/all') {
    let knex;
    try {
      knex = getKnexInstanceForServer(params.server);
    } catch {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (!knex) {
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }

    try {
      const now = Math.floor(Date.now() / 1000);
      const cache = spaiGuildAllListCache.get(knex);
      if (cache && cache.expires > now) {
        response.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Length': cache.data.byteLength,
          'Cache-Control': `Public, Max-Age=${(now - cache.expires) || 1}`,
        });
        response.write(cache.data);
        response.end();
      } else {
        const data = await knex('spai_current_guilds').select('tag', 'castle');
        const RESULT = Buffer.from(JSON.stringify({
          schemaVersion: '1.0.0',
          data: data || [],
        }));
        spaiGuildAllListCache.set(knex, {
          data: RESULT,
          expires: now + 300,
        });
        response.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Length': RESULT.byteLength,
          'Cache-Control': 'Public, Max-Age=300',
        });
        response.write(RESULT);
        response.end();
      }
    } catch (e) {
      console.error(e);
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
    }
  } else if (path.pathname === '/spai/player/all') {
    let knex;
    try {
      knex = getKnexInstanceForServer(params.server);
    } catch {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (!knex) {
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }

    try {
      const now = Math.floor(Date.now() / 1000);
      const cache = spaiPlayerAllListCache.get(knex);
      if (cache && cache.expires > now) {
        response.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Length': cache.data.byteLength,
          'Cache-Control': `Public, Max-Age=${(now - cache.expires) || 1}`,
        });
        response.write(cache.data);
        response.end();
      } else {
        const data = await knex('player_names').select('cwid', 'ign', 'castle', 'guild_tag');
        const RESULT = Buffer.from(JSON.stringify({
          schemaVersion: '1.0.0',
          data: data || [],
        }));
        spaiPlayerAllListCache.set(knex, {
          data: RESULT,
          expires: now + 300,
        });
        response.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Length': RESULT.byteLength,
          'Cache-Control': 'Public, Max-Age=300',
        });
        response.write(RESULT);
        response.end();
      }
    } catch (e) {
      console.error(e);
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
    }
  } else if (path.pathname === '/spai/player/count') {
    /** @type {import('knex')} */
    let knex;
    try {
      knex = getKnexInstanceForServer(params.server);
    } catch {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.filter == null) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.filter.match(/[^Ёёа-яА-Я\w\d _'-]/u)
      && params.filter !== '🌑'
      && params.filter !== '🐉'
      && params.filter !== '⚱️'
      && params.filter !== '🥔'
      && params.filter !== '🦈'
      && params.filter !== '🦌'
      && params.filter !== '🐺'
      && params.filter !== '🦅'
      && params.filter !== '🐢'
      && params.filter !== '🍆'
      && params.filter !== '☘️'
      && params.filter !== '🌹'
      && params.filter !== '🍁'
      && params.filter !== '🦇'
      && params.filter !== '🖤') {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (!knex) {
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    try {
      let query = knex('player_names');
      if (params.filter) {
        query = query.where('cwid', 'LIKE', `%${params.filter}%`)
          .orWhere('ign', 'LIKE', `%${params.filter}%`);
        if (params.filter.length < 5) {
          query = query.orWhere('castle', params.filter)
            .orWhere('guild_tag', 'LIKE', `%${params.filter}%`);
        }
      }
      query = query.count('*').as('count');
      const data = await query;
      const RESULT = Buffer.from(JSON.stringify({
        schemaVersion: '1.0.1',
        data: ((data || [])[0] || {})['count(*)'] || 0,
      }));
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': RESULT.byteLength,
        'Cache-Control': 'Public, Max-Age=300',
      });
      response.write(RESULT);
      response.end();
    } catch (e) {
      console.error(e);
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
    }
  } else if (path.pathname === '/spai/player/all/smart') {
    /** @type {import('knex')} */
    let knex;
    try {
      knex = getKnexInstanceForServer(params.server);
    } catch {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.startRow == null) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (!isFinite(Number(params.startRow))) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.fetchCount == null) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (!isFinite(Number(params.fetchCount))) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.filter == null) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.filter.match(/[^Ёёа-яА-Я\w\d _'-]/u)
      && params.filter !== '🌑'
      && params.filter !== '🐉'
      && params.filter !== '⚱️'
      && params.filter !== '🥔'
      && params.filter !== '🦈'
      && params.filter !== '🦌'
      && params.filter !== '🐺'
      && params.filter !== '🦅'
      && params.filter !== '🐢'
      && params.filter !== '🍆'
      && params.filter !== '☘️'
      && params.filter !== '🌹'
      && params.filter !== '🍁'
      && params.filter !== '🦇'
      && params.filter !== '🖤') {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.sortBy == null) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.sortBy !== 'cwid' && params.sortBy !== 'castle' && params.sortBy !== 'ign' && params.sortBy !== 'guild_tag' && params.sortBy !== 'null') {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.direction == null) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (params.direction !== 'asc' && params.direction !== 'desc') {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (!knex) {
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    try {
      let query = knex('player_names').select('cwid', 'ign', 'castle', 'guild_tag');
      if (params.filter) {
        query = query.where('cwid', 'LIKE', `%${params.filter}%`)
          .orWhere('ign', 'LIKE', `%${params.filter}%`);
        if (params.filter.length < 5) {
          query = query.orWhere('castle', params.filter)
            .orWhere('guild_tag', 'LIKE', `%${params.filter}%`);
        }
      }
      if (params.sortBy !== 'null') {
        query = query.orderBy(params.sortBy, params.direction);
      }
      query = query.offset(parseInt(params.startRow, 10))
        .limit(parseInt(params.fetchCount, 10));
      const data = await query;
      const RESULT = Buffer.from(JSON.stringify({
        schemaVersion: '1.0.0',
        data: data || [],
      }));
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': RESULT.byteLength,
        'Cache-Control': 'Public, Max-Age=120',
      });
      response.write(RESULT);
      response.end();
    } catch (e) {
      console.error(e);
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
    }
  } else if (path.pathname === '/auth/telegram') {
    if (checkBotAuthSignature(params)) {
      if (Date.now() / 1000 - 60 > Number(params.auth_date)) {
        response.writeHead(302, {
          Location: '/#/auth/error/outdated',
        });
        response.end();
      } else {
        let userUUID = uuid();
        while (verifiedUserAuthentications.has(userUUID)) {
          userUUID = uuid();
        }
        verifiedUserAuthentications.set(userUUID, params);
        response.writeHead(302, {
          Location: `/#/auth/success/${userUUID}`,
        });
        response.end();
      }
    } else {
      response.writeHead(302, {
        Location: '/#/auth/error/invalid',
      });
      response.end();
    }
  } else if (path.pathname === '/auth/telegram/check') {
    if (!params.token) {
      response.writeHead(400, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    if (!verifiedUserAuthentications.has(params.token)) {
      response.writeHead(403, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
    const originalQuery = verifiedUserAuthentications.get(params.token);
    const res = Buffer.from(JSON.stringify({
      id: Number(originalQuery.id),
      first_name: originalQuery.first_name,
      last_name: originalQuery.last_name,
      username: originalQuery.username,
      photo_url: originalQuery.photo_url,
    }));
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Length': res.byteLength,
    });
    response.write(res);
    response.end();
  } else {
    if (path.pathname === '/' && path.query) {
      const query = querystring.parse(path.query);
      if (!checkBotAuthSignature(query)) {
        response.writeHead(403, {
          'Content-Length': 0,
        });
        response.end();
        return;
      }
    }
    const sanitaryPath = normalize(path.pathname).replace(pathSanitizer, '');
    let filePathname = join(currentConfig.webserverHomeDirectory, sanitaryPath);
    let {
      ext,
    } = parsePath(filePathname);
    if (!ext) {
      ext = '.html';
      filePathname = join(filePathname, 'index.html');
    }
    let cacheTime = 86400;
    if (ext === '.html') {
      cacheTime = 60;
    }
    let mode = 'none';
    if (request.headers['accept-encoding']) {
      const acceptedEncoding = request.headers['accept-encoding'];
      const encodings = acceptedEncoding.split(', ');
      if (encodings.includes('gzip')) {
        mode = 'gzip';
      }
    }
    try {
      await sendFileToBrowser(filePathname, response, mode, cacheTime, mimeType[ext] || 'text/plain');
    } catch {
      response.writeHead(500, {
        'Content-Length': 0,
      });
      response.end();
      return;
    }
  }
}
function onServerUpgrade(request, socket, head) {
  'use strict';

  const {
    pathname,
  } = parse(request.url);
  for (let i = 0; i < websockets.length; i++) {
    const {
      path,
      server: webSocketServer,
    } = websockets[i];
    if (path.toLowerCase() === pathname.toLowerCase()) {
      webSocketServer.handleUpgrade(request, socket, head, (client) => {
        'use strict';

        webSocketServer.emit('connection', client, request);
      });
      return;
    }
  }
  socket.end();
}
(async () => {
  'use strict';

  /** @type {import('http').Server | null} */
  let httpServer = null;
  /** @returns {Promise<void>} */
  function closeHttpServer() {
    'use strict';

    return new Promise((resolve, reject) => {
      'use strict';

      if (httpServer) {
        httpServer.close((error) => {
          'use strict';

          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /** @returns {Promise<void>} */
  function reloadHttpServer() {
    'use strict';

    return new Promise((resolve, reject) => {
      'use strict';

      closeHttpServer().then(() => {
        'use strict';

        if (!httpServer) {
          httpServer = createServer({
          }, onReceiveRequest);
          httpServer.on('upgrade', onServerUpgrade);
        }
        httpServer.listen(currentConfig.httpListeningPort, '0.0.0.0', resolve);
      }, reject);
    });
  }

  /** @type {import('https').Server | null} */
  let httpsServer = null;
  /** @returns {Promise<void>} */
  function closeHttpsServer() {
    'use strict';

    return new Promise((resolve, reject) => {
      'use strict';

      if (httpsServer) {
        httpsServer.close((error) => {
          'use strict';

          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * @returns {Promise<void>}
   * @param {boolean=} forceCertificateChange
   */
  function reloadHttpsServer(forceCertificateChange) {
    'use strict';

    forceCertificateChange = forceCertificateChange || false;
    return new Promise((resolve, reject) => {
      'use strict';

      closeHttpsServer().then(() => {
        'use strict';

        if (!httpsServer || forceCertificateChange) {
          Promise.all([
            readFile(currentConfig.httpsCertificateFilePath),
            readFile(currentConfig.httpsPrivateKeyFilePath),
          ]).then((files) => {
            'use strict';

            const [cert, key] = files;

            httpsServer = httpsModule.createServer({
              cert,
              key,
            }, onReceiveRequest);
            httpsServer.on('upgrade', onServerUpgrade);
            httpsServer.listen(currentConfig.httpsListeningPort, '0.0.0.0', resolve);
          }, reject);
        } else {
          httpsServer.listen(currentConfig.httpsListeningPort, '0.0.0.0', resolve);
        }
      }, reject);
    });
  }

  async function reloadWebsockets() {
    'use strict';

    while (websockets.length) {
      websockets.pop();
    }
    for (const serverConfig of currentConfig.servers) {
      const connection = amqpConnect(serverConfig.amqp);
      for (const publicExchange of serverConfig.publicExchanges) {
        const ws = new WebSocketServer({
          clientTracking: true,
          noServer: true,
          perMessageDeflate: false,
        });
        for (const i of [serverConfig.trueName, ...serverConfig.aliases]) {
          websockets.push({
            path: `/${i}/${publicExchange}`,
            server: ws,
          });
        }
        connection.then((conn) => {
          'use strict';

          conn.createChannel().then((channel) => {
            'use strict';

            channel.assertQueue(null, {
              autoDelete: true,
              durable: false,
              exclusive: true,
            }).then((queueInfo) => {
              'use strict';

              Promise.all([
                channel.bindQueue(queueInfo.queue, 'API', publicExchange),
                channel.consume(queueInfo.queue, (msg) => {
                  'use strict';

                  ws.clients.forEach((client) => {
                    'use strict';

                    client.send(msg.content);
                  });
                }, {
                  exclusive: true,
                  noAck: true,
                }),
              ]).then(() => {
                'use strict';
              });
            });
          });
        });
      }
    }
  }

  currentConfig = await getConfig(async (newConfig) => {
    'use strict';

    const oldConfig = currentConfig;
    currentConfig = newConfig;
    if (newConfig.httpListeningPort !== oldConfig.httpListeningPort) {
      console.log('Reloading http server');
      reloadHttpServer();
    }
    if (newConfig.httpsListeningPort !== oldConfig.httpsListeningPort) {
      console.log('Reloading https server');
      reloadHttpsServer();
    }
    if (!isDeepStrictEqual(newConfig.servers, oldConfig.servers)) {
      console.log('Reloading websockets');
      reloadWebsockets();
    }
  });

  watchFile(currentConfig.httpsCertificateFilePath, {
    interval: 60000,
    persistent: false,
  }, (current, previous) => {
    'use strict';

    if (!isDeepStrictEqual(current, previous)) {
      console.log('reloading https server');
      reloadHttpsServer(true);
    }
  });

  await Promise.all([
    reloadHttpServer(),
    reloadHttpsServer(),
    reloadWebsockets(),
  ]);
})();
