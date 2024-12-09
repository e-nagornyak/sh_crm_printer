const { app, BrowserWindow, ipcMain, dialog } = require('electron');

const { createWindow } = require('./main/window-manager');
const { getPrinters, getPrintersNew } = require('./main/printer-utils');
const { handleDownloadAndPrint } = require('./main/file-download');
const { ensureConfigFileExists, getConfig, saveConfig } = require('./main/config-manager');

// Check for single instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Another instance is already running
  dialog.showMessageBoxSync({
    type: 'info',
    title: 'Application Already Running',
    message: 'The application is already running.',
    buttons: ['OK']
  });
  app.quit();
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Auto-launch setup
const AutoLaunch = require('electron-auto-launch');
const autoLauncher = new AutoLaunch({
  name: 'Sh. Printer',
  path: app.getPath('exe'),
  isHidden: true
});

autoLauncher.isEnabled().then((isEnabled) => {
  if (!isEnabled) {
    autoLauncher.enable();
  }
}).catch((err) => {
  console.error('Error during auto-launch setup:', err);
});

app.whenReady().then(() => {
  ensureConfigFileExists();
  createWindow();

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      dialog.showMessageBoxSync(mainWindow, {
        type: 'info',
        title: 'Application Already Running',
        message: 'The application is already running.',
        buttons: ['OK']
      });
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // IPC handlers
  ipcMain.handle('get-printers', async () => {
    try {
      return await getPrinters();
    } catch (error) {
      console.error('Error getting printers:', error);
      return [];
    }
  });
  // IPC handlers
  ipcMain.handle('get-printers-new', async () => {
    try {
      return await getPrintersNew();
    } catch (error) {
      console.error('Error getting printers:', error);
      return [];
    }
  });

  ipcMain.handle('get-config', getConfig);
  ipcMain.handle('save-config', async (event, newConfig) => saveConfig(newConfig));
  ipcMain.handle('download-and-print-pdf', handleDownloadAndPrint);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
