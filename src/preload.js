import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('printerAPI', {
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  getPrintersNew: () => ipcRenderer.invoke('get-printers-new'),
  downloadAndPrintPDF: (pdfUrl, printerLabel) => ipcRenderer.invoke('download-and-print-pdf', pdfUrl, printerLabel),
});

contextBridge.exposeInMainWorld('configAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config)
});



