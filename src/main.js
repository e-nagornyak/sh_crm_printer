const { app, BrowserWindow,ipcMain } = require('electron');
const path = require('node:path');
const { getPrinters } = require('pdf-to-printer');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // startServer();
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      devTools:true
    },
    // autoHideMenuBar: true,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  // stopServer();
});

// Обробляємо запит від рендерера для отримання принтерів
ipcMain.handle('get-printers', async () => {
  try {
    const printers = await getPrinters();
    return printers;
  } catch (error) {
    console.error('Error getting printers:', error);
    throw error;
  }
});
// Отримуємо директорію для даних користувача
const configPath = path.join(app.getPath('userData'), 'config.json');

// Функція для перевірки та створення файлу, якщо він не існує
const ensureConfigFileExists = async () => {
  try {
    // Перевіряємо, чи існує файл
    await fs.promises.access(configPath, fs.constants.F_OK);
    console.log('Config file exists');
  } catch (error) {
    // Якщо файл не існує, створюємо його з дефолтними налаштуваннями
    const defaultConfig = {
      defaultPrinter: ''
    };
    try {
      await fs.promises.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log('Config file created with default settings');
    } catch (writeError) {
      console.error('Error creating config file:', writeError);
    }
  }
};

// Викликаємо функцію для перевірки та створення конфігураційного файлу під час запуску
ensureConfigFileExists();

// IPC обробник для отримання конфігурації
ipcMain.handle('get-config', async () => {
  try {
    const data = await fs.promises.readFile(configPath, 'utf-8');
    console.log('data', data);
    return JSON.parse(data); // Повертаємо вміст конфігураційного файлу
  } catch (error) {
    console.error('Error reading config.json:', error);
    return { error: 'Failed to load config' };
  }
});

// IPC обробник для збереження конфігурації
ipcMain.handle('save-config', async (event, newConfig) => {
  try {
    await fs.promises.writeFile(configPath, JSON.stringify(newConfig, null, 2)); // Записуємо нові дані
    console.log('Config saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving config.json:', error);
    return false;
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
