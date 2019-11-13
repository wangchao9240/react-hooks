const { remote } = require('electron')
const Store = require('electron-store')
const $ = id => document.getElementById(id)

const settingStore = new Store({ name: 'settings' })

document.addEventListener('DOMContentLoaded', () => {
  // saved path before then read the old value and put it in the input
  let savedLocation =  settingStore.get('savedFileLocation') || ''
  if (savedLocation) $('savedFileLocation').value = savedLocation

  $('select-new-location').addEventListener('click', () => {
    remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      message: '选择文件的储存路径'
    })
    .then(result => {
      console.log(result)
      if (Array.isArray(result.filePaths) && !result.canceled) {
        $('savedFileLocation').value = result.filePaths[0]
        savedLocation = result.filePaths[0]
      }
    })
    .catch(err => {
      console.log('open dialog error:', err)
    })
  })

  $('settings-form').addEventListener('submit', () => {
    settingStore.set('savedFileLocation', savedLocation)
    remote.getCurrentWindow().close()
  })
})