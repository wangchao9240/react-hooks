const { app, ipcMain, Menu, dialog } = require('electron')
const AppWindow = require('./src/AppWindow')
const isDev = require('electron-is-dev')
const menuTemplate = require('./src/menuTemplate')
const path = require('path')
const Store = require('electron-store')
const settingStore = new Store({ name: 'settings' })
const QiniuManager = require('./src/utils/QiniuManager')

let mainWindow, settingsWindow;

const createManager = () => {
  const accessKey = settingStore.get('accessKey')
  const secretKey = settingStore.get('secretKey')
  const bucketName = settingStore.get('bucketName')
  return new QiniuManager(accessKey, secretKey, bucketName)
}

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
    settingsWindow.removeMenu()
    settingsWindow.on('closed', () => {
      settingsWindow = null
    })
  })
  // set the menu
  let menu  = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  ipcMain.on('config-is-saved', () => {
    // watch out menu items index for mac and windows
    let qiniuMenu = process.platform === 'darwin' ? menu.items[3] : menu.items[2]
    const switchItems = (toggle) => {
      [1, 2, 3].forEach(number => {
        qiniuMenu.submenu.items[number].enabled = toggle
      })
    }
    const qiniuIsConfiged = ['accessKey', 'secretKey', 'bucketName'].every(key => !!settingStore.get(key))
    switchItems(qiniuIsConfiged)
  })

  ipcMain.on('upload-file', (event, data) => {
    const manager = createManager()
    manager.uploadFile(data.key, data.path).then(res => {
      console.log('上传成功', res)
      mainWindow.webContents.send('active-file-uploaded')
    }).catch(err => dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确'))
  })
})