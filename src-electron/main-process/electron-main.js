import { app, BrowserWindow, nativeTheme } from 'electron';

const { autoUpdater } = require('electron-updater');

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

let mainWindow;

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}

function createWindow() {
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

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, 'electron-preload.js')
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

// auto update start

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', info => {
  sendStatusToWindow('Update available.');
});
autoUpdater.on('update-not-available', info => {
  sendStatusToWindow('Update not available.');
});
autoUpdater.on('error', err => {
  sendStatusToWindow('Error in auto-updater. ' + err);
});
autoUpdater.on('download-progress', progressObj => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message =
    log_message +
    ' (' +
    progressObj.transferred +
    '/' +
    progressObj.total +
    ')';
  sendStatusToWindow(log_message);
});
autoUpdater.on('update-downloaded', info => {
  sendStatusToWindow('Update downloaded');
});

//auto update end

app.on('ready', createWindow);

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

app.on('ready', function() {
  autoUpdater.checkForUpdatesAndNotify();
});
