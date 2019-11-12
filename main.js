const { app, ipcMain, Menu } = require('electron')
const AppWindow = require('./src/AppWindow')
const isDev = require('electron-is-dev')
const menuTemplate = require('./src/menuTemplate')
const path = require('path')

let mainWindow, settingsWindow;

app.on('ready', () => {
  const mainWindowConfig = {
    width: 1440,
    height: 768
  }
  const urlLocation = isDev ? 'http://localhost:3000' : 'dummyurl'

  mainWindow = new AppWindow(mainWindowConfig, urlLocation)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // hook up main events
  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 500,
      height: 400,
      parent: mainWindow
    }
    const settingsFileLocation = `file://${path.join(__dirname, 'src/settings/settings.html')}`

    settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)

    settingsWindow.on('closed', () => {
      settingsWindow = null
    })
  })
  // set the menu
  const menu  = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
})