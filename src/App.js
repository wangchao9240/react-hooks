import React from 'react';
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
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
    <div className="App container-fluid">
      <div className="row">
        <div className="col-3 bg-light left-panel">
          <FileSearch onFileSearch={(value) => console.log(value)}></FileSearch>
          <FileList files={data}></FileList>
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
