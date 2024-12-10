import { contextBridge, ipcRenderer } from 'electron'
import { ContextBridgeAPI } from "./constants/context-bridge-apis";

contextBridge.exposeInMainWorld('cacheRegisterAPI', {
  sendToCacheRegister: (commands) => ipcRenderer.invoke('send-to-cache-register', commands),
});

contextBridge.exposeInMainWorld('printerAPI', {
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  getPrintersNew: () => ipcRenderer.invoke('get-printers-new'),
  downloadAndPrintPDF: (pdfUrl, printerLabel) => ipcRenderer.invoke('download-and-print-pdf', pdfUrl, printerLabel),
});

contextBridge.exposeInMainWorld('configAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config)
});

contextBridge.exposeInMainWorld(ContextBridgeAPI.loggingAPI.name, {
  createLog: (level, message, metadata = {}) => {
    console.log('level, message, metadata = {}',level, message, metadata = {})
    return ipcRenderer.invoke(ContextBridgeAPI.loggingAPI.keys.CREATE_LOG,{
      level,
      message,
      timestamp: new Date().toISOString(),
      ...metadata
    })
  },
  getLogs: (options = {}) => {
    const {
      page = 1,
      limit = 50,
      level = null,
      startDate = null,
      endDate = null
    } = options;

    return ipcRenderer.invoke(ContextBridgeAPI.loggingAPI.keys.GET_LOGS, {
      page,
      limit,
      level,
      startDate,
      endDate
    })
  },
  clearLogs: () => ipcRenderer.invoke(ContextBridgeAPI.loggingAPI.keys.CLEAR_LOGS),
});



