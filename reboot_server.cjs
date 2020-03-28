/* eslint-disable camelcase */
const {
  execSync,
} = require('child_process');
const {
  copyFileSync,
  readFileSync,
} = require('fs');

let will_server_need_reboot = false;
try {
  console.log('Checking if server.js file changed');
  const newServerFile = readFileSync('./server.cjs', 'utf8');
  const oldServerFile = readFileSync('/home/puppy0cam/DogeStock/Web/server.cjs', 'utf8');
  if (newServerFile !== oldServerFile) {
    console.log('server.cjs changed');
    copyFileSync('./server.cjs', '/home/puppy0cam/DogeStock/Web/server.cjs');
    will_server_need_reboot = true;
  } else {
    console.log('server.cjs unchanged');
  }
} catch (e) {
  console.log('error while checking server file. Will assume reboot is needed');
  console.warn(e);
  copyFileSync('./server.cjs', '/home/puppy0cam/DogeStock/Web/server.cjs');
  will_server_need_reboot = true;
}
try {
  console.log('Checking if credentials.cjs file changed');
  const newCredentialsFile = readFileSync('./credentials.cjs', 'utf8');
  const oldCredentialsFile = readFileSync('/home/puppy0cam/DogeStock/Web/credentials.cjs', 'utf8');
  if (newCredentialsFile !== oldCredentialsFile) {
    console.log('credentials.cjs changed');
    copyFileSync('./credentials.cjs', '/home/puppy0cam/DogeStock/Web/credentials.cjs');
    will_server_need_reboot = true;
  } else {
    console.log('credentials.cjs unchanged');
  }
} catch (e) {
  console.log('error while checking credentials file. Will assume reboot is needed');
  console.warn(e);
  copyFileSync('./credentials.cjs', '/home/puppy0cam/DogeStock/Web/credentials.cjs');
  will_server_need_reboot = true;
}
try {
  console.log('Checking if nginx.conf file changed');
  const newCredentialsFile = readFileSync('./nginx.conf', 'utf8');
  const oldCredentialsFile = readFileSync('/home/puppy0cam/DogeStock/Web/nginx.conf', 'utf8');
  if (newCredentialsFile !== oldCredentialsFile) {
    console.log('nginx.conf changed');
    copyFileSync('./nginx.conf', '/home/puppy0cam/DogeStock/Web/nginx.conf');
    will_server_need_reboot = true;
  } else {
    console.log('nginx.conf unchanged');
  }
} catch (e) {
  console.log('error while checking credentials file. Will assume reboot is needed');
  console.warn(e);
  copyFileSync('./nginx.conf', '/home/puppy0cam/DogeStock/Web/nginx.conf');
  will_server_need_reboot = true;
}
try {
  console.log('Checking if nginx_locations.conf file changed');
  const newCredentialsFile = readFileSync('./nginx_locations.conf', 'utf8');
  const oldCredentialsFile = readFileSync('/home/puppy0cam/DogeStock/Web/nginx_locations.conf', 'utf8');
  if (newCredentialsFile !== oldCredentialsFile) {
    console.log('nginx_locations.conf changed');
    copyFileSync('./nginx_locations.conf', '/home/puppy0cam/DogeStock/Web/nginx_locations.conf');
    will_server_need_reboot = true;
  } else {
    console.log('nginx_locations.conf unchanged');
  }
} catch (e) {
  console.log('error while checking credentials file. Will assume reboot is needed');
  console.warn(e);
  copyFileSync('./nginx_locations.conf', '/home/puppy0cam/DogeStock/Web/nginx_locations.conf');
  will_server_need_reboot = true;
}
if (will_server_need_reboot) {
  console.log('Rebooting webserver');
  execSync('pm2 restart DogeStockWeb', {
    stdio: 'inherit',
  });
} else {
  console.log('Not rebooting webserver');
}
console.log('Done');
