const qiniu = require('qiniu')
const QiniuManager = require('./src/utils/QiniuManager')
const path = require('path')
// generate mac
const accessKey = 'BrmkaTUP7WE5T-IENf6mxjQN8lFIv_b75xuhY7-b'
const secretKey = 'JAj4Re51e32hoW0kUwqoQ5SxfRMsycB4hhGr9R03'
var localFile = "C:\\Users\\Administrator\\Documents\\first.md"
var key ='-35eef20822b872ca.jpg'
const downloadPath = path.join(__dirname, key)

// generate uploadtoken
// const options = {
//   scope: 'clouddoc9241',
// }

const manager = new QiniuManager(accessKey, secretKey, 'clouddoc9241')

manager.downloadFile(key, downloadPath)
.then(res => console.log('hahah'))
.catch(err => console.log(err))

// manager.uploadFile(key, localFile)
// .then(result => {
//   console.log('上传成功', result)
//   return manager.deleteFile(key)
// })
// .then(res => {
//   console.log('删除成功', res)
// })
// .catch(err => {
//   console.log(err)
// })

// manager.getBucketDomain()
// .then(res => console.log(res))
// .catch(err => console.log(err))

// manager.generateDownloadLink(key)
// .then(data => {
//   console.log(data)
//   return manager.generateDownloadLink('first.md')
// })
// .then(data1 => {
//   console.log(data1)
// })
// manager.deleteFile(key)

// var bucketManager = new qiniu.rs.BucketManager(mac, config)
// var publicBucketDomain = 'http://q0w1xvzao.bkt.clouddn.com'
// // 公开空间访问链接
// var publicDownloadUrl = bucketManager.publicDownloadUrl(publicBucketDomain, key)
// console.log(publicDownloadUrl)