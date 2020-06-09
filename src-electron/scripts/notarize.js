const { notarize } = require('electron-notarize');
const envFile = require('../../.quasar.env.json');
// const env = envFile[process.env.QENV];

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'com.day41.weather',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: envFile.production.APPLEID,
    appleIdPassword: envFile.production.APPLEPASSID,
  });
};
