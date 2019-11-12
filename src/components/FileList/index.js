import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import useKeyPress from '../../hooks/useKeyPress'
import PropTypes from 'prop-types'
import useContextMenu from '../../hooks/useContextMneu'
import { getParentNode } from '../../utils/helper'

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const [editStatus, setEditStatus] = useState(false)
  const [value, setValue] = useState('')
  const enterPress = useKeyPress(13)
  const ESCPress = useKeyPress(27)

  let node = useRef(null)

  const closeSearch = (editItem) => {
    setEditStatus(false)
    setValue('')
    // if we are editing a newly created file, we should delete this file when pressing delete
    if (editItem && editItem.isNew) {
      onFileDelete(editItem.id)
    }
  }
  
  const clickedItem = useContextMenu([
    {
      label: '打开',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement.dataset.id) onFileClick(parentElement.dataset.id)
      }
    },
    {
      label: '重命名',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement.dataset.id) {
          setEditStatus(parentElement.dataset.id)
          setValue(parentElement.dataset.title)
        }
      }
    },
    {
      label: '删除',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement.dataset.id) onFileDelete(parentElement.dataset.id)
      }
    }
  ], '.file-list', [files])

  useEffect(() => {
    const editItem = files.find(file => file.id === editStatus)
    if (enterPress && editStatus && value.trim() !== '') {
      onSaveEdit(editItem.id, value, editItem.isNew)
      closeSearch()
    } else if (ESCPress && editStatus) {
      closeSearch(editItem)
    }
  })

  useEffect(() => {
    const newFile = files.find(file => file.isNew)
    if (newFile) {
      setEditStatus(newFile.id)
      setValue(newFile.title)
    }
  }, [files])

  useEffect(() => {
    if (editStatus) node.current.focus()
  }, [editStatus])

  return (
    <ul className="list-group list-group-flush file-list">
      {
        files.map(file => (
          <li
            className="list-group-item bg-light row d-flex align-items-center file-item mx-0"
            key={file.id}
            data-id={file.id}
            data-title={file.title}
          >
            {
              (file.id !== editStatus) && !file.isNew ? (
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
                    <input ref={node} placeholder={'请输入文件名称'} onChange={(e) => setValue(e.target.value)} type="text" className="form-control col-10" value={value} />
                    <button onClick={() => closeSearch(file)} type="button" className="col-2 icon-button btn">
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
