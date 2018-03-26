import { app, BrowserWindow } from 'electron'
import path from 'path'
import pug from 'electron-pug'
import dotenv from 'dotenv'
import reload from 'electron-reload'
import { getURLFromPathname } from './lib/electron-helpers'

// set up environment variables
dotenv.config()

reload('__dirname')

const locals = {}
pug({ pretty: true }, locals)

let win

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 800,
    backgroundColor: '#eeeeee',
  })

  win.loadURL(getURLFromPathname(path.join(__dirname, 'index.jade')))

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
