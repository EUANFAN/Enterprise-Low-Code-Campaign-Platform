import React from 'react'
import { observer } from 'mobx-react'
import HTML2Canvas from 'html2canvas'
import Project from '../preview/Project'

@observer
class Shortcut extends React.Component {
  constructor(props) {
    super(props)
    this._project = null
  }

  screenshot(scale = 1) {
    if (!this._project) {
      return Promise.reject(new Error('Project not set'))
    }
    const pages = this.getPageElements()
    return Promise.all(
      pages.map((pageElement) => {
        const widgets = [].slice.call(pageElement.querySelectorAll('.widget'))
        const boundingBox = widgets.reduce(
          (prev, current) => {
            const { top, left, width, height } = current.getBoundingClientRect()
            const newLeft = Math.min(prev.left, left + god.scrollX)
            const newRight = Math.max(prev.right, left + god.scrollX + width)
            return {
              top: Math.min(prev.top, top + god.scrollY),
              left: newLeft > 0 ? newLeft : 0,
              right: newRight > 375 ? 375 : newRight,
              bottom: Math.max(prev.bottom, top + god.scrollY + height)
            }
          },
          {
            top: Number.MAX_SAFE_INTEGER,
            left: Number.MAX_SAFE_INTEGER,
            right: Number.MIN_SAFE_INTEGER,
            bottom: Number.MIN_SAFE_INTEGER
          }
        )

        boundingBox.width = boundingBox.right - boundingBox.left
        boundingBox.height = boundingBox.bottom - boundingBox.top
        const scaleArray = Array.isArray(scale) ? scale : [scale, scale]
        pageElement.style.height = `${boundingBox.height}px`
        return HTML2Canvas(pageElement, {
          useCORS: true,
          x: boundingBox.left,
          y: -pageElement.scrollTop,
          scale: Math.max(...scaleArray),
          width: boundingBox.width,
          height: boundingBox.height,
          logging: process.env.NODE_ENV === 'dev'
        }).then((canvas) => canvas.toDataURL())
      })
    )
  }

  getPageElements = () => {
    if (!this._project._container) {
      return []
    }

    return [].slice.call(this._project._container.children)
  }

  render() {
    return (
      <Project
        getRef={(component) => {
          this._project = component
        }}
        {...this.props}
      />
    )
  }
}

export default Shortcut
