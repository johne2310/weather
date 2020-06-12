import { app, BrowserWindow, Menu, nativeTheme } from 'electron';
// This is the ES5 version (using require)
// const updater = require('./updater');
// Change import to ES6 syntax
//import update module which contains all the aut-update logic
import { updater } from './updater';
import { menuTemplate } from './menu-template';

//set path variable to support import of electron-preload request
const path = require('path');

try {
  if (
    process.platform === 'win32' &&
    nativeTheme.shouldUseDarkColors === true
  ) {
    require('fs').unlinkSync(
      require('path').join(app.getPath('userData'), 'DevTools Extensions')
    );
  }
} catch (_) {}

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require('path')
    .join(__dirname, 'statics')
    .replace(/\\/g, '\\\\');
}

export let mainWindow;
const menu = Menu.buildFromTemplate(menuTemplate);

function createWindow() {
  // activate auto-updater module
  // setTimeout(updater, 10000);
  if (process.env.NODE_ENV !== 'development') {
    // only run autoupdate if not dev mode
    updater();

    updater
  }
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: QUASAR_NODE_INTEGRATION,
      nodeIntegrationInWorker: QUASAR_NODE_INTEGRATION,

      //enableRemoteModule will be set to false by default in Electron v10
      enableRemoteModule: true,

      // preload: path.resolve(__dirname, 'electron-preload.js'),

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, 'electron-preload.js'),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);
  // mainWindow.loadURL(envFile.production.APP_URL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  //initialise menu
  Menu.setApplicationMenu(menu);
}

app.on('ready', createWindow);

// app.on('ready', function() {
//   updater();
// });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
