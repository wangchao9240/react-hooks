const { app, ipcMain, Menu, dialog } = require('electron')
const AppWindow = require('./src/AppWindow')
const isDev = require('electron-is-dev')
const menuTemplate = require('./src/menuTemplate')
const path = require('path')
const Store = require('electron-store')
const settingStore = new Store({ name: 'settings' })
const fileStore = new Store({ name: 'Files Data' })
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

  ipcMain.on('download-file', (event, data) => {
    const manager = createManager()
    const filesObj = fileStore.get('files')
    const { key, path, id } = data
    manager.getStat(data.key).then(resp => {
      const serverUpdatedTime = Math.round(resp.putTime / 10000)
      const localUpdatedTime = filesObj[data.id].updatedAt
      if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
        manager.downloadFile(key, path).then(() => {
          mainWindow.webContents.send('file-downloaded', { status: 'download-success', id })
        })
      } else {
        mainWindow.webContents.send('file-downloaded', { status: 'no-new-file', id })
      }
    }).catch(err => {
      if (err.statusCode === 612) mainWindow.webContents.send('file-downloaded', { status: 'no-file', id })
    })
  })

  ipcMain.on('upload-all-to-qiniu', (event, data) => {
    mainWindow.webContents.send('loading-status', true)
    const manager = createManager()
    const filesObj = fileStore.get('files') || {}
    const uploadPromiseArr = Object.keys(filesObj).map(key => {
      const file = filesObj[key]
      return manager.uploadFile(`${file.title}.md`, file.path)
    })
    Promise.all(uploadPromiseArr).then(result => {
      // show uploaded message
      dialog.showMessageBox({
        type: 'info',
        title: `成功上传了${result.length}个文件`,
        message: `成功上传了${result.length}个文件`
      })
      mainWindow.webContents.send('files-uploaded')
    }).catch(err => {
      console.log('上传全部云端失败:' + err)
      dialog.showErrorBox('上传全部云端失败:', err)
    }).finally(() => {
      mainWindow.webContents.send('loading-status', false)
    })
  })
})