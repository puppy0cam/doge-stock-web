/* eslint-disable */
'use strict';
const {
  createBrotliCompress,
  createGzip,
  constants: {
    BROTLI_MODE_FONT,
    BROTLI_MODE_GENERIC,
    BROTLI_MODE_TEXT,
    BROTLI_PARAM_MODE,
    BROTLI_PARAM_QUALITY,
    BROTLI_MAX_QUALITY,
    BROTLI_PARAM_SIZE_HINT,
    Z_BEST_COMPRESSION,
  },
} = require('zlib');
const {
  promises: {
    stat,
    readdir,
    unlink,
  },
  createReadStream,
  createWriteStream,
} = require('fs');
const {
  join,
} = require('path');
async function compress(path) {
  'use strict';
  const stats = await stat(path);
  if (stats.isDirectory()) {
    const dirents = await readdir(path);
    await Promise.all(dirents.map((a) => join(path,a)).map(compress));
  } else if (stats.isFile()) {
    if (!path.toLowerCase().endsWith('.gz') && !path.toLowerCase().endsWith('.br')) {
      const params = [];
      params[BROTLI_PARAM_MODE] = (path.toLowerCase().endsWith('.woff') || path.toLowerCase().endsWith('.woff2')) ? BROTLI_MODE_FONT : (path.toLowerCase().endsWith('.js') || path.toLowerCase().endsWith('.css') || path.toLowerCase().endsWith('.html')) ? BROTLI_MODE_TEXT : BROTLI_MODE_GENERIC;
      params[BROTLI_PARAM_QUALITY] = BROTLI_MAX_QUALITY;
      params[BROTLI_PARAM_SIZE_HINT] = stats.size;
      const brotli = createBrotliCompress({
        params,
      });
      const brotliWriter = createWriteStream(path + '.br', {
        autoClose: true,
        emitClose: true,
      });
      brotliWriter.once('close', () => {
        stat(path + '.br').then((brStats) => {
          if (brStats.size >= stats.size) {
            unlink(path + '.br');
          }
        });
      });
      const gzip = createGzip({
        level: Z_BEST_COMPRESSION,
      });
      const gzipWriter = createWriteStream(path + '.gz', {
        autoClose: true,
        emitClose: true,
      });
      gzipWriter.once('close', () => {
        stat(path + '.gz').then((gzStats) => {
          if (gzStats.size >= stats.size) {
            unlink(path + '.gz');
          }
        });
      });
      const originReader = createReadStream(path, {
        autoClose: true,
        emitClose: true,
      });
      originReader.pipe(gzip);
      originReader.pipe(brotli);
      brotli.pipe(brotliWriter);
      gzip.pipe(gzipWriter);
    } else {
      console.log('Found already compressed file "%s"! Ignoring.', path);
    }
  }
}
compress('./dist');
