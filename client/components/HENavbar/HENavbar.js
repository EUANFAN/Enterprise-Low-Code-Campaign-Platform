import React from 'react'
const { project } = god.PageData
import classNames from 'classnames'
import { noop } from 'utils/FunctionUtils'
import { validateRoleLimit } from 'common/utils'

import './HENavbar.less'

const arrowLeft = require('../imgs/arrow_left.png')
const logoSrc = 'https://m.xiwang.com/resource/logo-black-1652800314873.png'

function HENavbarNavigator(props) {
  const logoStyle = { width: '100px', margin: '0 auto' }

  return (
    <div className="he-navbar-navigator">
      <img src={logoSrc} style={logoStyle} onClick={props.onClick}></img>
    </div>
  )
}

export default class HENavbar extends React.Component {
  static defaultProps = {
    className: '',
    onPageChange: noop,
    renderActions: noop,
    leftPartWidth: '212px'
  }

  returnHome = () => {
    if (this.props.backFunc) {
      this.props.backFunc()
    } else {
      if (validateRoleLimit('themesCenter')) {
        location.href = '/theme'
      }
    }
  }

  redirect = async () => {
    const { config } = this.props
    if (config && typeof config['TITLE_FUNC'] === 'function') {
      await config.TITLE_FUNC(project)
    }
  }

  render() {
    const {
      className: classNameFromProp,
      children,
      actionElement,
      leftPartWidth,
      config
    } = this.props
    const className = classNames(['he-navbar', classNameFromProp])
    let leftElement = (
      <div className="he-navbar__left-part__group">
        <HENavbarNavigator
          className="he-navbar__left-part__navigator"
          onClick={this.returnHome.bind(this)}
        ></HENavbarNavigator>
        {config && config['ShowTitle'] && (
          <p
            className="he-navbar__left-part__text"
            onClick={this.redirect.bind(this)}
          >
            {' '}
            <img src={arrowLeft} />
            {config['Title']}
          </p>
        )}
      </div>
    )

    return (
      <div className={className}>
        <div className="he-navbar__left-part" style={{ width: leftPartWidth }}>
          {leftElement}
        </div>
        <div className="he-navbar__main-part">{children}</div>
        <div className="he-navbar__right-part">{actionElement}</div>
      </div>
    )
  }
}
