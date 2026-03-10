import React from 'react'
import reactCSS from 'reactcss'

const ENTER = 13

export const Swatch = ({
  color,
  style,
  onClick = () => {},
  onHover,
  title = color,
  children,
  focus,
  focusStyle = {}
}) => {
  const styles = reactCSS({
    default: {
      swatch: {
        background: color,
        height: '100%',
        width: '100%',
        cursor: 'pointer',
        position: 'relative',
        outline: 'none',
        ...style,
        ...(focus ? focusStyle : {})
      }
    }
  })

  const handleClick = (e) => onClick(color, e)
  const handleKeyDown = (e) => e.keyCode === ENTER && onClick(color, e)
  const handleHover = (e) => onHover(color, e)

  const optionalEvents = {}
  if (onHover) {
    optionalEvents.onMouseOver = handleHover
  }

  return (
    <div
      style={styles.swatch}
      onClick={handleClick}
      title={title}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...optionalEvents}
    >
      {children}
    </div>
  )
}

export default Swatch
