import React, { useState } from 'react';
import uuidv4 from 'uuid/v4'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import BottomBtn from './components/BottomBtn'
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import TabList from './components/TabList'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'

import SimpleMDE from "react-simplemde-editor"
import "easymde/dist/easymde.min.css"

const data = [
  {
    id: '1',
    title: '1',
    body: '### ceshi1'
  },
  {
    id: '2',
    title: '2',
    body: '### ceshi2'
  },
  {
    id: '3',
    title: '3',
    body: '### ceshi3'
  }
]

function App() {
  const [files, setFiles] = useState(data)
  const [activeFileId, setActiveFileId] = useState('')
  const [openedFileIds, setOpenedFileIds] = useState([])
  const [unsavedFileIds, setUnsavedFileIds] = useState([])
  const [searchedFiles, setSearchedFiles] = useState([])

  const openedFiles = openedFileIds.map(openId => files.find(file => file.id === openId))

  const activeFile = files.find(file => file.id === activeFileId)

  const fileListArr = searchedFiles.length > 0 ? searchedFiles : files

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
    // loop through file array update
    const newFiles = files.map(file => {
      if (file.id === id) file.body = val
      return file
    })
    setFiles(newFiles)
    // udate unsavedIds
    if (!unsavedFileIds.includes(id)) setUnsavedFileIds([...unsavedFileIds, id])
  }

  const deleteFile = id => {
    // filter out the current file id
    const newFiles = files.filter(file => file.id !== id)
    setFiles(newFiles)
    // close the tab if opened
    tabClose(id)
  }

  const updateFileName = (id, title) => {
    // loop through files and update the title
    const newFiles = files.map(file => {
      if (file.id === id) {
        file.title = title
        file.isNew = false
      }
      return file
    })
    setFiles(newFiles)
  }

  const fileSearch = keyword => {
    // filter out the new files based on the keyword
    const newFiles = files.filter(file => file.title.includes(keyword))

    setSearchedFiles(newFiles)
  }

  const createFile = () => {
    const newId = uuidv4()
    const newFiles = [
      ...files,
      {
        id: newId,
        title: '',
        body: '###请输入 Markdown',
        createdAt: new Date().getTime(),
        isNew: true
      }
    ]
    setFiles(newFiles)
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
