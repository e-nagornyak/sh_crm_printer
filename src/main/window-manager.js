const { BrowserWindow, Tray, Menu, dialog, app } = require('electron');
const path = require('node:path');

let mainWindow;
let tray;

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
    autoHideMenuBar: false,
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
  //mainWindow.webContents.openDevTools();
};


module.exports = {
  createWindow
};
