/* eslint-disable */

const fs = require('fs');
const util = require('util');

const credentialsFile = './credentials.json';

/** @typedef {{httpListeningPort:number;webserverHomeDirectory:string;:servers:{trueName:string;aliases:string[];database:{client:"mysql";connection:{host:string;database:string;multipleStatements:boolean;password:string;user:string;supportBigNumbers:boolean;charset:string;}};}[];}} Config */

module.exports.getConfig =
/**
 * @param {(config: Config) => void} onConfigReloaded function called if the config changes after the promise is resolved.
 * @returns {Promise<Config>}
 */
function getConfig(onConfigReloaded) {
  return new Promise(async (resolve, reject) => {
    /** @type {Config} */
    let currentConfig = {
      httpListeningPort: NaN,
      servers: [],
      webserverHomeDirectory: '/dev/null',
    };
    try {
      const stat = await fs.promises.stat(credentialsFile);
      if (!stat.isFile()) {
        throw stat;
      }
    } catch {
      reject(new Error('Credentials file either does not exist or is not a file'));
    }
    fs.watch('./credentials.json', {
      encoding: 'utf8',
      persistent: false,
      recursive: false,
    }, (event) => {
      if (event === 'change') {
        const oldPend = pendingReload;
        pendingReload = new Promise((resolve) => {
          oldPend.finally(() => {
            resolve(reloadConfig(onConfigReloaded));
          });
        });
      } else if (event === 'rename') {
        console.warn('Credentials file was renamed or deleted. This could have unusual side effects');
      }
    });
    let pendingReload = reloadConfig(resolve);
    /** @param {(config: Config) => void} callback */
    async function reloadConfig(callback) {
      const data = await fs.promises.readFile(credentialsFile, {
        encoding: 'utf8',
      });
      try {
        /** @type {Config} */
        const config = await JSON.parse(data);
        if (typeof config.httpListeningPort !== 'number') {
          throw new TypeError('httpListeningPort must be a number');
        } else if (typeof config.webserverHomeDirectory !== 'string') {
          throw new TypeError('webserverHomeDirectory must be a string');
        } else if (!Array.isArray(config.servers)) {
          throw new TypeError('servers must be an array');
        } else {
          for (const server of config.servers) {
            if (!Array.isArray(server.aliases)) {
              throw new TypeError('servers[item].aliases must be an array');
            } else if (typeof server.database !== 'object' || server.database === null) {
              throw new TypeError('servers[item].database must be an object');
            } else if (typeof server.database.client !== 'string') {
              throw new TypeError('servers[item].database.client must be a string');
            } else if (typeof server.database.connection !== 'object' || server.database.connection === null) {
              throw new TypeError('servers[item].database.connection must be an object');
            } else if (typeof server.database.connection.host !== 'string') {
              throw new TypeError('servers[item].database.connection.host must be a string');
            } else if (typeof server.database.connection.database !== 'string') {
              throw new TypeError('servers[item].database.connection.database must be a string');
            } else if (typeof server.database.connection.multipleStatements !== 'boolean') {
              throw new TypeError('servers[item].database.connection.multipleStatements must be a boolean');
            } else if (typeof server.database.connection.password !== 'string') {
              throw new TypeError('servers[item].database.connection.password must be a string');
            } else if (typeof server.database.connection.user !== 'string') {
              throw new TypeError('servers[item].database.connection.user must be a string');
            } else if (typeof server.database.connection.supportBigNumbers !== 'boolean') {
              throw new TypeError('servers[item].database.connection.supportBigNumbers must be a boolean');
            } else if (typeof server.database.connection.charset !== 'string') {
              throw new TypeError('servers[item].database.connection.charset must be a string');
            } else if (typeof server.trueName !== 'string') {
              throw new TypeError('servers[item].trueName must be a string');
            } else if (typeof server.botToken !== 'string') {
              throw new TypeError('servers[item].botToken must be a string');
            } else {
              for (const i of server.aliases) {
                if (typeof i !== 'string') {
                  throw new TypeError('servers[item].aliases[item] must be a string');
                }
              }
            }
          }
        }
        try {
          if (callback === resolve || !util.isDeepStrictEqual(config, currentConfig)) {
            if (callback === resolve) {
              console.log('Credentials file loaded');
            } else {
              console.log('Credentials file updated');
            }
            currentConfig = config;
            const res = callback(config);
            if (res && res.then) {
              if (res.catch) {
                res.catch((error) => {
                  console.warn('Uncaught error when passing config to callback', error);
                });
              } else {
                res.then(() => {

                }, (error) => {
                  console.warn('Uncaught error when passing config to callback', error);
                });
              }
            }
          }
        } catch (e) {
          console.warn('Uncaught error when passing config to callback', e);
        }
      } catch (e) {
        console.warn('Config file is invalid', e);
      }
    }
  });
};
