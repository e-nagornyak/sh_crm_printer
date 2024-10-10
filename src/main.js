import { dialog, Menu, Tray } from "electron";

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const printer = require('pdf-to-printer');
const fs = require('fs');
import { z } from 'zod';

const AutoLaunch = require('electron-auto-launch');
const axios = require('axios');
const http = require('http');
const { exec } = require('child_process');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Налаштування автозапуску
const autoLauncher = new AutoLaunch({
  name: 'Sh. Printer',
  path: app.getPath('exe'), // Шлях до виконуваного файлу додатка,
  mac: false,
  isHidden: true
});

// Увімкнення автозапуску при запуску програми
autoLauncher.isEnabled().then((isEnabled) => {
  if (!isEnabled) {
    autoLauncher.enable();
  }
}).catch((err) => {
  console.error('Error during auto-launch setup:', err);
});



// // Функція для отримання списку принтерів (тут вся інфа)
// const getPrinters = (callback) => {
//   exec('wmic printer get /format:csv', (error, stdout, stderr) => {
//     if (error) {
//       callback(error, null);
//       return;
//     }
//     if (stderr) {
//       callback(new Error(stderr), null);
//       return;
//     }
//
//     // Парсимо результат у масив об'єктів
//     const lines = stdout.split('\n').filter(line => line.trim() !== '');
//     const headers = lines[0].split(',');
//     const printers = lines.slice(1).map(line => {
//       const data = line.split(',');
//       const printer = {};
//       headers.forEach((header, index) => {
//         printer[header.trim()] = data[index].trim();
//       });
//       return printer;
//     });
//
//     callback(null, printers);
//   });
// };
// Функція для отримання списку принтерів (тільки Name і DeviceID)
const getPrinters = (callback) => {
  exec('wmic printer get Name,DeviceID /format:csv', (error, stdout, stderr) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (stderr) {
      callback(new Error(stderr), null);
      return;
    }

    // Парсимо результат у масив об'єктів
    const lines = stdout.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(','); // Перший рядок - заголовки (Name, DeviceID)
    const printers = lines.slice(1).map(line => {
      const data = line.split(',');
      const printer = {
        Name: data[0].trim(),       // Отримуємо назву принтера
        DeviceID: data[1].trim(),   // Отримуємо DeviceID принтера
      };
      return printer;
    });

    callback(null, printers);
  });
};

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      devTools: true
    },
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    autoHideMenuBar: true,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // Створюємо іконку трею
  let tray = null
  tray = new Tray(path.join(__dirname, 'assets', 'icon.jpg'));

  // Додаємо контекстне меню до іконки трею
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Exit',
      click: () => {
        // Show confirmation dialog when quitting from the context menu
        const choice = dialog.showMessageBoxSync(mainWindow, {
          type: 'question',
          buttons: ['Quit', 'Cancel'],
          defaultId: 1,
          title: 'Confirmation of closing',
          message: 'Are you sure you want to quit?',
        });

        if (choice === 0) { // If "Quit" is selected
          app.isQuitting = true; // Set flag to true to allow quitting
          app.quit(); // Quit the app
        }
      },
    },
  ]);

  tray.setToolTip('Sh. Printer');
  tray.setContextMenu(contextMenu);

  // Відображаємо вікно при кліку на іконку трею
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  // Ховаємо вікно при згортанні
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  // Перехоплюємо подію закриття вікна і просто ховаємо його замість завершення
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
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
    getPrinters((error, printers) => {
      if (error) {
        return []
      }
      console.log(printers)
     return printers
    });
  } catch (error) {
    console.error('Error getting printers:', error);
    throw error;
  }
});
// Отримуємо директорію для даних користувача
const configPath = path.join(app.getPath('userData'), 'config.json');

// Функція для перевірки та створення файлу, якщо він не існує або структура неправильна
const ensureConfigFileExists = async () => {
  const defaultConfig = {
    token: '',
    printers: [
      { label: 'Factura Printer', default: '' },
      { label: 'Label Printer', default: '' }
    ]
  };

  const configSchema = z.object({
    token: z.string(),
    printers: z.array(
      z.object({
        label: z.enum(['Factura Printer', 'Label Printer']),
        default: z.string()
      })
    )
  });

  try {
    // Перевіряємо, чи існує файл
    await fs.promises.access(configPath, fs.constants.F_OK);
    console.log('Config file exists');

    // Читаємо існуючий файл
    const configFile = await fs.promises.readFile(configPath, 'utf-8');
    const parsedConfig = JSON.parse(configFile);

    // Перевіряємо, чи структура файлу відповідає схемі
    configSchema.parse(parsedConfig);
    console.log('Config file has a valid structure');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid config structure, resetting to default');
    } else {
      console.log('Config file does not exist, creating a new one with default settings');
    }

    // Створюємо файл з дефолтними налаштуваннями
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

const filePath = path.join(app.getPath('userData'), 'temp_downloaded_file.pdf');

// Завантаження файлу
const downloadFile = async (url, outputPath) => {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const getConfig = async () => {
  try {
    const data = await fs.promises.readFile(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading config.json:', error);
    throw new Error('Failed to load config');
  }
};

// Обробник для завантаження та друку PDF
ipcMain.on('download-and-print-pdf', async (event, pdfUrl, printerLabel) => {
  try {
    console.info(`Received request to download and print: ${pdfUrl}`);

    // Завантаження PDF файлу
    const filePath = path.join(app.getPath('userData'), 'temp_downloaded_file.pdf');
    await downloadFile(pdfUrl, filePath);
    console.info(`File downloaded successfully: ${filePath}`);

    // Отримуємо конфігурацію
    const config = await getConfig();
    const defaultPrinterName = config.printers.find(p => p?.label === 'Factura Printer')

    // Налаштування принтера із конфігурації
    const options = {
      printer: defaultPrinterName?.default,
      scale: 'noscale',
      paperSize: '6',
      win32: [
        '-print-settings "noscale"',
        '-print-settings "center"',
        '-orientation portrait',
        '-paper-size A6',
        '-margin-top 0',
        '-margin-right 0',
        '-margin-bottom 0',
        '-margin-left 0'
      ],
    };

    // Друк файлу
    await printer.print(filePath, options);
    console.info('The file was successfully sent for printing.');

    // Видалення тимчасового файлу після друку
    setTimeout(() => {
      fs.unlinkSync(filePath);
      console.info('Temporary file deleted.');
    }, 500);

  } catch (error) {
    console.error(`Error processing file: ${error.message}`);
  }
});
