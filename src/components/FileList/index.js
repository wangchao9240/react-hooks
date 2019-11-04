import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import useKeyPress from '../../hooks/useKeyPress'
import PropTypes from 'prop-types'

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const [editStatus, setEditStatus] = useState(false)
  const [value, setValue] = useState('')
  const enterPress = useKeyPress(13)
  const ESCPress = useKeyPress(27)

  const closeSearch = () => {
    setEditStatus(false)
    setValue('')
  }
  
  useEffect(() => {
    if (enterPress && editStatus) {
      const editItem = files.find(file => file.id === editStatus)
      onSaveEdit(editItem.id, value)
      closeSearch()
    } else if (ESCPress && editStatus) {
      closeSearch()
    }
  })

  return (
    <ul className="list-group list-group-flush file-list">
      {
        files.map(file => (
          <li
            className="list-group-item bg-light row d-flex align-items-center file-item"
            key={file.id}
          >
            {
              file.id !== editStatus ? (
                <>
                  <span className={'col-2'}>
                    <FontAwesomeIcon
                      size="lg"
                      icon={faMarkdown}
                    ></FontAwesomeIcon>
                  </span>
                  <span onClick={() => onFileClick(file.id)} className={'col-8 c-link'}>{file.title}</span>
                  <button onClick={() => {
                    setEditStatus(file.id)
                    setValue(file.title)
                  }} type="button" className="col-1 icon-button btn">
                    <FontAwesomeIcon title="编辑" size="lg" icon={faEdit}></FontAwesomeIcon>
                  </button>
                  <button onClick={() => onFileDelete(file.id)} type="button" className="col-1 icon-button btn">
                    <FontAwesomeIcon title="删除" size="lg" icon={faTrash}></FontAwesomeIcon>
                  </button>
                </>
              ) : (
                  <>
                    <input onChange={(e) => setValue(e.target.value)} type="text" className="form-control col-10" value={value} />
                    <button onClick={closeSearch} type="button" className="col-2 icon-button btn">
                      <FontAwesomeIcon title="关闭" size="lg" icon={faTimes}></FontAwesomeIcon>
                    </button>
                  </>
              )
            }
          </li>
        ))
      }
    </ul>
  )
}

FileList.protoTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func
}

export default FileList
