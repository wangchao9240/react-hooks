const { remote, ipcRenderer } = require('electron')
const Store = require('electron-store')
const qiniuConfigArr = ['#savedFileLocation', '#accessKey', '#secretKey', '#bucketName']
const $ = selector => {
  const result = document.querySelectorAll(selector)
  return result.length > 1 ? result : result[0]
}

const settingStore = new Store({ name: 'settings' })

document.addEventListener('DOMContentLoaded', () => {
  // saved path before then read the old value and put it in the input
  let savedLocation =  settingStore.get('savedFileLocation') || ''
  if (savedLocation) $('#savedFileLocation').value = savedLocation

  // get the saved config data and fill in the inputs
  qiniuConfigArr.forEach(selector => {
    const savedValue = settingStore.get(selector.substr(1))
    if (savedValue) {
      $(selector).value = savedValue
    }
  })
  $('#select-new-location').addEventListener('click', () => {
    remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      message: '选择文件的储存路径'
    })
    .then(result => {
      if (Array.isArray(result.filePaths) && !result.canceled) {
        $('#savedFileLocation').value = result.filePaths[0]
        // savedLocation = result.filePaths[0]
      }
    })
    .catch(err => {
      console.log('open dialog error:', err)
    })
  })

  $('#settings-form').addEventListener('submit', (e) => {
    // e.preventDefault()
    qiniuConfigArr.forEach(selector => {
      if ($(selector)) {
        let { id, value } = $(selector)
        settingStore.set(id, value ? value : '')
      }
    })
    // sent a event back to main process to enable menu items if qiniu is configed
    ipcRenderer.send('config-is-saved')
    remote.getCurrentWindow().close()
  })

  $('.nav-tabs').addEventListener('click', e => {
    e.preventDefault()
    $('.nav-link').forEach(ele => {
      ele.classList.remove('active')
    })
    e.target.classList.add('active')
    $('.config-area').forEach(ele => {
      ele.style.display = 'none'
    })
    $(e.target.dataset.tab).style.display = 'block'
  })
})