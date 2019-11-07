import React, { useState } from 'react';
import uuidv4 from 'uuid/v4'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import BottomBtn from './components/BottomBtn'
import { faPlus, faFileImport, faSave } from '@fortawesome/free-solid-svg-icons'
import TabList from './components/TabList'
import { flattenArr, objToArr } from './utils/helper'
import fileHelper from './utils/fileHelper'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'

import SimpleMDE from "react-simplemde-editor"
import "easymde/dist/easymde.min.css"


// require node.js modules
const path = window.require('path')
const { remote } = window.require('electron')
const Store = window.require('electron-store')

const fileStore = new Store({ name: 'Files Data' })

const saveFilesToStore = files => {
  // we don't have to store all infomations in file system, eg: isNew, body, etc
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt } = file
    result[id] = {
      id,
      path,
      title,
      createdAt
    }
    return result
  }, {})
  fileStore.set('files', filesStoreObj)
}

function App() {
  const [files, setFiles] = useState(fileStore.get('files') || {})
  const [activeFileId, setActiveFileId] = useState('')
  const [openedFileIds, setOpenedFileIds] = useState([])
  const [unsavedFileIds, setUnsavedFileIds] = useState([])
  const [searchedFiles, setSearchedFiles] = useState([])
  const filesArr = objToArr(files)
  const savedLocation = remote.app.getPath('documents')

  const openedFiles = openedFileIds.map(openId => files[openId])

  const activeFile = files[activeFileId]

  const fileListArr = searchedFiles.length > 0 ? searchedFiles : filesArr

  const fileClick = fileId => {
    // set current active file
    setActiveFileId(fileId)
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
    const newFile = { ...files[id], body: val }
    setFiles({ ...files, [id]: newFile })
    // udate unsavedIds
    if (!unsavedFileIds.includes(id)) setUnsavedFileIds([...unsavedFileIds, id])
  }

  const deleteFile = async id => {
    try {
      await fileHelper.deleteFile(files[id].path)
      // filter out the current file id
      delete files[id]
      setFiles(files)
      saveFilesToStore(files)
      // close the tab if opened
      tabClose(id)
    } catch (err) {
      console.log(`deleteFileError: ${err}`)
    }
  }

  const updateFileName = async (id, title, isNew) => {
    const newPath = path.join(savedLocation, `${title}.md`)
    const oldPath = path.join(savedLocation, `${files[id].title}.md`)
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath }
    const newFiles = { ...files, [id]: modifiedFile }
    try {
      if (isNew) {
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
      await fileHelper.writeFile(path.join(savedLocation, `${activeFile.title}.md`), activeFile.body)
      setUnsavedFileIds(unsavedFileIds.filter(id => id !== activeFile.id))
    } catch (err) {
      console.log(`saveCurrentFileError:${err}`)
    }
  }

  return (
    <div className="App container-fluid px-0">
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
              <BottomBtn text="导入" colorClass="btn-success" icon={faFileImport}></BottomBtn>
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
              <div className="col">
                <BottomBtn text="保存" onBtnClick={saveCurrentFile} colorClass="btn-primary" icon={faSave}></BottomBtn>
              </div>
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
