import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'

const FileSearch = ({ title, onFileSearch }) => {
  const [inputActive, setInputActive] = useState(false)
  const [value, setValue] = useState('')
  let node = useRef(null)

  const closeSearch = (e) => {
    e.preventDefault()
    setInputActive(false)
    setValue('')
  }

  useEffect(() => {
    const handleInputEvent = (e) => {
      const { keyCode } = e
      if (keyCode === 13 && inputActive) {
        onFileSearch(value)
      } else if (keyCode === 27 && inputActive) {
        closeSearch(e)
      }
    }
    document.addEventListener('keyup', handleInputEvent)
    return () => {
      document.removeEventListener('keyup', handleInputEvent)
    }
  })

  useEffect(() => {
    if (inputActive) node.current.focus()
  }, [inputActive])

  return (
    <div className="alert alert-primary">
      { !inputActive ? (
        <div className="d-flex justify-content-between align-items-center">
          <span>{title}</span>
          <button onClick={() => setInputActive(true)} type="button" className="icon-button btn">
            <FontAwesomeIcon size="lg" title={'搜索'} icon={faSearch}></FontAwesomeIcon>
          </button>
        </div>
      ) : (
        <div className="d-flex justify-content-between align-items-center">
          <input ref={node} onChange={(e) => setValue(e.target.value)} type="text" className="form-control" value={value}/>
          <button onClick={closeSearch} type="button" className="icon-button btn">
            <FontAwesomeIcon title="关闭" size="lg" icon={faTimes}></FontAwesomeIcon>
          </button>
        </div>
      ) }
    </div>
  )
}

FileSearch.propTypes = {
  title: PropTypes.string,
  onFileSearch: PropTypes.func.isRequired
}

FileSearch.defaultProps = {
  title: '我的云文档'
}

export default FileSearch