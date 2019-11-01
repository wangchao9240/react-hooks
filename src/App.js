import React from 'react';
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'

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

function App() {
  return (
    <div className="App container-fluid">
      <div className="row">
        <div className="col bg-light left-panel">
          <FileSearch onFileSearch={(value) => console.log(value)}></FileSearch>
          <FileList files={data}></FileList>
        </div>
        <div className="col bg-primary right-panel">
          <h1>this is the right</h1>
        </div>
      </div>
    </div>
  );
}

export default App;
