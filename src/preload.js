import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('ipcRenderer', {
  // Додаємо специфічну функцію для отримання шляху userData
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

  // You can expose other APIs you need here.
  // ...
})

contextBridge.exposeInMainWorld('printerAPI', {
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  downloadAndPrintPDF: (pdfUrl, printerLabel) => ipcRenderer.invoke('download-and-print-pdf', pdfUrl, printerLabel),
});

contextBridge.exposeInMainWorld('configAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config)
});



