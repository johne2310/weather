//Modules
const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const mainWindow = require('./electron-main.js').mainWindow;

const window = require('electron').BrowserWindow;
const focusedWindow = window.getAllWindows()[0];

//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------

autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';
const logger = autoUpdater.logger;

logger.info('focussedWindow: ' + mainWindow);

/*
- log file is based on Electron process (e.g. main)
- log file location ~Library/Logs/Quasar Weather/main.log
- where Quasar Weather = productName from package.json
 */

//This function communicates the download progress message to the renderer (index.vue)
function sendStatusToWindow(text) {
  logger.info(text);
  if (mainWindow !== null) {
    mainWindow.webContents.send('message', text);
  } else {
    logger.info('Win does not exist');
  }
}

//Disable auto-download of update file
autoUpdater.autoDownload = false;

//single export to check for and apply any available updates
module.exports = () => {
  //Check for updates (GH Releases)
  autoUpdater.checkForUpdates().catch(error => {
    dialog.showErrorBox('There was an error', error + ' occurred');
    logger.info('There was an error checking for update' + error);
  });

  // Listen for update found
  autoUpdater.on('update-available', info => {
    logger.info('There is an update available');
    dialog
      .showMessageBox({
        title: 'Update available',
        type: 'info',
        message: `A new version of Quasar Weather (v.${info.version}) is available. Do you want to download it?`,
        buttons: ['Update', 'Not this time'],
      })
      .then(result => {
        logger.info('result.response: ' + result.response);
        return result.response;
      })
      .then(buttonIndex => {
        if (buttonIndex === 0) {
          logger.info('User chose to update');
          autoUpdater
            .downloadUpdate()
            .then(() => {
              logger.info('Update has been downloaded!');
            })
            .catch(error =>
              logger.info(
                'There has been an error downloading the update' + error
              )
            );
        } else {
          logger.info('User declined update');
        }
      });
  });

  autoUpdater.on('update-downloaded', () => {
    logger.info('Starting Quit and Install');
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update ready',
        message: 'Install and restart now?',
        buttons: ['Yes', 'Later'],
      })
      .then(result => {
        return result.response;
      })
      .then(buttonIndex => {
        if (buttonIndex === 0) {
          autoUpdater.quitAndInstall(false, true);
        }
      });
  });

  //Implement a progress bar for the update download

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
};
