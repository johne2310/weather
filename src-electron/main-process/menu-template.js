import { app } from 'electron';
import { mainWindow } from './electron-main';

const isMac = process.platform === 'darwin';
const versionNo = app.getVersion();
const appName = app.getName();

export const menuTemplate = [
  ...(isMac
    ? [
        {
          role: 'appMenu',
        },
      ]
    : []),
  {
    label: 'Weather',
    submenu: [
      {
        label: 'Get local weather',
        accelerator: 'CommandorControl+W',
        click() {
          mainWindow.webContents.send('weather-here');
        },
      },
    ],
  },
  {
    label: 'Help',
    submenu: [
      {
        label: appName + ': v' + versionNo,
      },
    ],
  },
];
