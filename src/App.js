import React, { useState, useEffect } from 'react';
import uuidv4 from 'uuid/v4'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import BottomBtn from './components/BottomBtn'
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import TabList from './components/TabList'
import { flattenArr, objToArr, timestampToString } from './utils/helper'
import fileHelper from './utils/fileHelper'
import useIpcRenderer from './hooks/useIpcRenderer'
import Loader from './components/Loader'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'

import SimpleMDE from "react-simplemde-editor"
import "easymde/dist/easymde.min.css"

// require node.js modules
const fs = window.require('fs')
const path = window.require('path')
const { remote, ipcRenderer } = window.require('electron')
const Store = window.require('electron-store')

const fileStore = new Store({ name: 'Files Data' })
const settingStore = new Store({ name: 'settings' })
const getAutoSync = () => ['accessKey', 'secretKey', 'bucketName', 'enableAutoSync'].every(key => !!settingStore.get(key))

const saveFilesToStore = files => {
  // we don't have to store all infomations in file system, eg: isNew, body, etc
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt, isSynced, updatedAt } = file
    result[id] = {
      id,
      path,
      title,
      createdAt,
      isSynced,
      updatedAt
    }
    return result
  }, {})
  fileStore.set('files', filesStoreObj)
}

const updateLocalFiles = (files) => new Promise(resolve => {
  // eslint-disable-next-line
  Object.values(files).map(item => {
    fs.stat(item.path, (err, stats) => {
      if (err) resolve({ status: '99', id: item.id })
    })
  })
  setTimeout(() => {
    resolve({ status: '000' })
  }, 800);
})

function App() {
  const [files, setFiles] = useState(fileStore.get('files') || {})
  const [activeFileId, setActiveFileId] = useState('')
  const [openedFileIds, setOpenedFileIds] = useState([])
  const [unsavedFileIds, setUnsavedFileIds] = useState([])
  const [searchedFiles, setSearchedFiles] = useState([])
  const [isLoading, setLoading] = useState(false)
  const filesArr = objToArr(files)
  const savedLocation = settingStore.get('savedFileLocation') || remote.app.getPath('documents')

  const openedFiles = openedFileIds.map(openId => files[openId])

  const activeFile = files[activeFileId]

  const fileListArr = searchedFiles.length > 0 ? searchedFiles : filesArr

  // check the file store if match the local files when project loaded
  // if need load, then set files and store
  useEffect(() => {
    async function updateFiles() {
      const needUpdate = await updateLocalFiles(files)
      if (needUpdate.status !== '000') {
        const { [needUpdate.id]: value, ...afterFiles } = files
        setFiles(afterFiles)
        saveFilesToStore(afterFiles)
      }
    }
    updateFiles()
  },[])

  const fileClick = async fileId => {
    // set current active file
    setActiveFileId(fileId)
    const currentFile = files[fileId]
    const { id, title, path, isLoaded } = currentFile
    if (!currentFile.isLoaded) {
      if (getAutoSync()) {
        ipcRenderer.send('download-file', { key: `${title}.md`, path, id })
      } else {
        try {
          const value = await fileHelper.readFile(currentFile.path)
          const newFile = { ...files[fileId], body: value, isLoaded: true }
          setFiles({ ...files, [fileId]: newFile })
        } catch (err) {
          console.log(`fileClickError: ${err}`)
        }
      }
    }
    // if oepned files don't have the currentId
    // then add new FileId to oepnedFiles
    if (openedFileIds.includes(fileId)) return
    // add new fileId to oepned files
    setOpenedFileIds([...openedFileIds, fileId])
  }

  // set current active file
  const tabClick = fileId => setActiveFileId(fileId)

  const tabClose = id => {
    // remove currentId from oepnedFileId
    const tabsWithout = openedFileIds.filter(fileId => fileId !== id)
    setOpenedFileIds(tabsWithout)
    // set the active to the first opened tab if still have tabs left
    if (tabsWithout.length) setActiveFileId(tabsWithout[0])
    else setActiveFileId('')
  }

  const fileChange = (id, val) => {
    if (val === files[id].body) return
    const newFile = { ...files[id], body: val }
    setFiles({ ...files, [id]: newFile })
    // udate unsavedIds
    if (!unsavedFileIds.includes(id)) setUnsavedFileIds([...unsavedFileIds, id])
  }

  const deleteFile = async id => {
    try {
      // same as delete files[id]
      const { [id]: value, ...afterDelete } = files
      if (files[id].isNew) {
        setFiles(afterDelete)
      } else {
        await fileHelper.deleteFile(files[id].path)
        // filter out the current file id
        setFiles(afterDelete)
        saveFilesToStore(afterDelete)
        // close the tab if opened
        tabClose(id)
      }
    } catch (err) {
      console.log(`d eleteFileError: ${err}`)
    }
  }

  const updateFileName = async (id, title, isNew) => {
    // if isNew is false, path should be old dirname + new title
    const newPath = isNew ? path.join(savedLocation, `${title}.md`) : path.join(path.dirname(files[id].path), `${title}.md`)
    const oldPath = files[id].path
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath }
    const newFiles = { ...files, [id]: modifiedFile }
    try {
      if (isNew) {
        const existTitle = Object.values(files).find(file => file.title === title)
        if (existTitle) {
          alert('已存在相同标题 请重新填写title')
          return
        }
        await fileHelper.writeFile(newPath, files[id].body)
      } else {
        await fileHelper.renameFile(oldPath, newPath)
      }
      setFiles(newFiles)
      saveFilesToStore(newFiles)
    } catch (err) {
      console.log(`updateFileNameError:${err}`)
    }
  }

  const fileSearch = keyword => {
    // filter out the new files based on the keyword
    const newFiles = filesArr.filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }

  const createFile = () => {
    const newId = uuidv4()
    const newFile = {
      id: newId,
      title: '',
      body: '###请输入 Markdown',
      createdAt: new Date().getTime(),
      isNew: true
    }
    setFiles({ ...files, [newId]: newFile })
  }

  const saveCurrentFile = async () => {
    try {
      if (!activeFile || !activeFile.path) return
      await fileHelper.writeFile(path.join(activeFile.path), activeFile.body)
      setUnsavedFileIds(unsavedFileIds.filter(id => id !== activeFile.id))
      if (getAutoSync()) ipcRenderer.send('upload-file', { key: `${activeFile.title}.md`, path: activeFile.path })
    } catch (err) {
      console.log(`saveCurrentFileError:${err}`)
    }
  }

  const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '选择导入的 Markdown 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'Markdown files',
          extensions: ['md']
        }
      ]
    }).then(res => {
      if (Array.isArray(res.filePaths)) {
        // filter out the path we already have in electron store
        const filteredPaths = res.filePaths.filter(path => {
          const alreadyAdded = Object.values(files).find(file => {
            console.log(file.path, path)
            return file.path === path
          })
          return !alreadyAdded
        })
        // extend the path array to an array contains files info
        // [{ id: '1', path: '', title: 'XX' }]
        const importFilesArr = filteredPaths.map(filepath => {
          return {
            id: uuidv4(),
            title: path.basename(filepath, path.extname(filepath)),
            path: filepath
          }
        })
        // get the new files object in flattenArr
        const newFiles = { ...files, ...flattenArr(importFilesArr) }
        // setState and update electron store
        setFiles(newFiles)
        saveFilesToStore(newFiles)
        if (importFilesArr.length) {
          remote.dialog.showMessageBox({
            type: 'info',
            title: `成功导入了${importFilesArr.length}个文件`,
            message: `成功导入了${importFilesArr.length}个文件`
          })
        }
      }
    }).catch(err => {
      console.log(`importFilesError: ${err}`)
    })
  }

  const activeFileUploaded = () => {
    const { id } = activeFile
    const modifiedFile = { ...files[id], isSynced: true, updatedAt: new Date().getTime() }
    const newFiles = { ...files, [id]: modifiedFile }
    setFiles(newFiles)
    saveFilesToStore(newFiles)
  }

  const activeFileDownloaded = (event, message) => {
    const currentFile = files[message.id]
    const { id, path } = currentFile
    fileHelper.readFile(path).then(value => {
      let newFile
      if (message.status === 'download-success') {
        newFile = { ...files[id], body: value, isLoaded: true, isSynced: true, updatedAt: new Date().getTime() }
      } else {
        newFile = { ...files[id], body: value, isLoaded: true }
      }
      const newFiles = { ...files, [id]: newFile }
      setFiles(newFiles)
      saveFilesToStore(newFiles)
    })
  }

  const filesUploaded = () => {
    const newFiles = objToArr(files).reduce((result, file) => {
      const currentTime = new Date().getTime()
      result[file.id] = {
        ...files[file.id],
        isSynced: true,
        updatedAt: currentTime
      }
      return result
    }, {})
    setFiles(newFiles)
    saveFilesToStore(newFiles)
  }

  useIpcRenderer({
    'create-new-file': createFile,
    'import-file': importFiles,
    'save-edit-file': saveCurrentFile,
    'active-file-uploaded': activeFileUploaded,
    'file-downloaded': activeFileDownloaded,
    'loading-status': (message, status) => setLoading(status),
    'files-uploaded': filesUploaded
  })

  return (
    <div className="App container-fluid px-0">
      { isLoading ? <Loader></Loader> : null }
      <div className="row no-gutters">
        <div className="col bg-light left-panel">
          <FileSearch onFileSearch={fileSearch}></FileSearch>
          <FileList
            onFileDelete={deleteFile}
            onFileClick={fileClick}
            files={fileListArr}
            onSaveEdit={updateFileName}
          ></FileList>
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn text="新建" onBtnClick={createFile} colorClass="btn-primary" icon={faPlus}></BottomBtn>
            </div>
            <div className="col">
              <BottomBtn text="导入" onBtnClick={importFiles} colorClass="btn-success" icon={faFileImport}></BottomBtn>
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          { activeFile ? (
            <>
              <TabList
                activeId={activeFileId}
                onTabClick={tabClick}
                onCloseTab={tabClose}
                files={openedFiles}
                unSaveIds={unsavedFileIds}
              ></TabList>
              <SimpleMDE
                key={activeFile.id}
                onChange={val => fileChange(activeFile.id, val)}
                value={activeFile.body}
                options={{
                  minHeight: '515px'
                }}
              ></SimpleMDE>
              { activeFile.isSynced ? (
                <span className="sync-status">已同步，上次同步{timestampToString(activeFile.updatedAt)}</span>
              ) : null }
              {/* <div className="col">
                <BottomBtn text="保存" onBtnClick={saveCurrentFile} colorClass="btn-primary" icon={faSave}></BottomBtn>
              </div> */}
            </>
          ) : (
            <div className="start-page">
              选择或者创建新的 Markdown 文档
            </div>
          ) }
        </div>
      </div>
    </div>
  );
}

export default App;
