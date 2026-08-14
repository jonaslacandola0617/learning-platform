// Preload: expose nothing sensitive, just let the page know it's in Electron
const { contextBridge } = require('electron')
contextBridge.exposeInMainWorld('isElectron', true)
