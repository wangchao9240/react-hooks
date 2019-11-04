import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './index.scss'


const TabList = ({ files, activeId, unSaveIds, onTabClick, onCloseTab }) => {
  return (
    <ul className="nav nav-pills tablist-component">
      { files.map(file => {
        const withUnsavedMark = unSaveIds.includes(file.id)
        const fClassName = classNames({
          'nav-link': true,
          'active': file.id == activeId,
          'withUnsaved': withUnsavedMark
        })
        return (
          <li className="nav-item" key={file.id}>
            <a
              onClick={e => {
                e.preventDefault()
                onTabClick(file.id)
              }}
              href="#"
              className={fClassName}
            >
              {file.title}
              <span onClick={(e) => {
                e.stopPropagation()
                onCloseTab(file.id)
              }} className="ml-2 close-icon">
                <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
              </span>
              { withUnsavedMark && <span className="rounded-circle ml-2 unsaved-icon"></span> }
            </a>
          </li>
        )
      }) }
    </ul>
  )
}

TabList.propTypes = {
  files: PropTypes.array,
  activeId: PropTypes.string,
  unSaveIds: PropTypes.array,
  onTabClick: PropTypes.func,
  onCloseTab: PropTypes.func
}

TabList.defaultProps = {
  unSaveIds: []
}

export default TabList