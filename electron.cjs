const { app, BrowserWindow, ipcMain, protocol } = require('electron')
const path = require('path')
const fs   = require('fs')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 640,
    minHeight: 500,
    title: 'GMRC – Hula ang Salita',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    backgroundColor: '#EBF4FF',
  })

  win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  win.setMenuBarVisibility(false)
}

app.whenReady().then(() => {
  // Serve files from the "images" folder that sits next to the .exe
  // The exe lives at:  <install dir>/GMRC - Hula ang Salita.exe
  // Images live at:    <install dir>/images/
  const exeDir = path.dirname(app.getPath('exe'))
  const imagesDir = path.join(exeDir, 'images')

  protocol.registerFileProtocol('appimg', (request, callback) => {
    const filename = decodeURIComponent(request.url.replace('appimg:///', '').replace('appimg://', ''))
    const filePath = path.join(imagesDir, filename)
    callback({ path: filePath })
  })

  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
