import React from 'react';
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
    title: '1'
  },
  {
    id: 2,
    title: '2'
  },
  {
    id: 3,
    title: '3'
  }
]

const defaultFiles = [
  {
    id: '1',
    title: 'tab1'
  },
  {
    id: '2',
    title: 'tab2'
  },
]

function App() {
  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col bg-light left-panel">
          <FileSearch onFileSearch={(value) => console.log(value)}></FileSearch>
          <FileList
            onFileDelete={id => console.log('deleteing', id)}
            onFileClick={(id) => console.log(id)}
            files={data}
            onSaveEdit={(id, value) => {console.log(id, value)}}
          ></FileList>
          <div className="row no-gutters">
            <div className="col">
              <BottomBtn text="新建" colorClass="btn-primary" icon={faPlus}></BottomBtn>
            </div>
            <div className="col">
              <BottomBtn text="导入" colorClass="btn-success" icon={faFileImport}></BottomBtn>
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          <TabList
            activeId={'1'}
            onTabClick={(id) => console.log(id)}
            onCloseTab={id => console.log(id)}
            files={defaultFiles}
            unSaveIds={['1', '2']}
          ></TabList>
          <SimpleMDE
            onChange={val => console.log(val)}
            value={'### ceshi'}
            options={{
              minHeight: '515px'
            }}
          ></SimpleMDE>
        </div>
      </div>
    </div>
  );
}

export default App;
