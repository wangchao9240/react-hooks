import React, { useState } from 'react';
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
    id: 1,
    title: '1',
    body: '### ceshi1'
  },
  {
    id: 2,
    title: '2',
    body: '### ceshi2'
  },
  {
    id: 3,
    title: '3',
    body: '### ceshi3'
  }
]
function App() {
  const [files, setFiles] = useState(data)
  const [activeFileId, setActiveFileId] = useState('')
  const [openedFileIds, setOpenedFileIds] = useState([])
  const [unsavedFileIds, setUnsavedFileIds] = useState([])

  const openedFiles = openedFileIds.map(openId => files.find(file => file.id === openId))
  const activeFile = files.find(file => file.id === activeFileId)
  
  const fileClick = fileId => {
    // set current active file
    setActiveFileId(fileId)
    // if opendFiles don't have the current Id
    if (openedFileIds.includes(fileId)) return
    // set new fileId to oepnedFiles
    setOpenedFileIds([...openedFileIds, fileId])
  }

  const tabClick = fileId => setActiveFileId(fileId)

  const tabClose = id => {
    // remove this current id from oepnsId
    const tabsWithout = openedFileIds.filter(fileId => fileId !== id)
    setOpenedFileIds(tabsWithout)
    // set the active to the first oepned tab if still tabs left
    if (tabsWithout.length > 0) setActiveFileId(tabsWithout[0])
    else  setActiveFileId('')
  }

  const fileChange = (id, value) => {
    // loop through file array to update to new value
    const newFiles = files.map(file => {
      if (file.id === id) {
        file.body = value
      }
      return file
    })
    setFiles(newFiles)
    // update unsaved ids
    if (!unsavedFileIds.includes(id)) {
      setUnsavedFileIds([...unsavedFileIds, id])
    }
  }
  
  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 bg-light left-panel">
          <FileSearch onFileSearch={(value) => console.log(value)}></FileSearch>
          <FileList
            onFileDelete={id => console.log('deleteing', id)}
            onFileClick={fileClick}
            files={files}
            onSaveEdit={(id, value) => {console.log(id, value)}}
          ></FileList>
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn text="新建" colorClass="btn-primary" icon={faPlus}></BottomBtn>
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
                key={activeFile && activeFile.id}
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
