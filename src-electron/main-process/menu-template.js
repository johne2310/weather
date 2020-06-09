import { app } from 'electron';
import { mainWindow } from './electron-main';

const isMac = process.platform === 'darwin';
const versionNo = app.getVersion();

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
        label: 'Version: ' + versionNo,
      },
    ],
  },
];
