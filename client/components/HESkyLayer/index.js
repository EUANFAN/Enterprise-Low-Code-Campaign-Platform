import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { noop } from 'utils/FunctionUtils';

import './index.less';

function isTargetInParent(target, component) {
  let node = target;

  do {
    if (node === component) {
      return true;
    }
    node = node.parentElement;
  } while (node != null);

  return false;
}

export default class HESkyLayer extends React.Component {
  _skyLayer;
  _element = React.createRef();

  static defaultProps = {
    className: '',
    clickable: true,
    centered: true,
    transparent: false,
    onClick: noop,
    onOverlayClick: noop,
    onClickAway: noop,
  };

  constructor(props) {
    super(props);

    this._skyLayer = this._getSkyLayer();
  }

  componentDidMount() {
    god.addEventListener('mousedown', this._handleWindowClick, true);
  }

  componentWillUnmount() {
    god.removeEventListener('mousedown', this._handleWindowClick, true);
  }

  _getSkyLayer = () => {
    let target = document.getElementById('sky-layer');
    if (target) {
      return target;
    }

    const skyLayerElement = document.createElement('div');
    skyLayerElement.id = 'sky-layer';
    if (document.body) {
      document.body.appendChild(skyLayerElement);
    }
    return skyLayerElement;
  };

  // Check for click away
  _handleWindowClick = (event) => {
    const { current } = this._element;
    const { target } = event;
    if (!current || !target) {
      return;
    }

    if (isTargetInParent(target, current)) {
      return;
    }
    this.props.onClickAway(event);
  };

  _handleClick = (event) => {
    const { onClick, onOverlayClick } = this.props;

    onClick(event);
    if (event.currentTarget === event.target) {
      onOverlayClick(event);
    }
  };

  render() {
    const {
      className: classNameFromProp,
      children,
      clickable,
      transparent,
      centered,
    } = this.props;
    const className = classNames(['he-sky-layer', classNameFromProp], {
      'he-sky-layer--clickable': clickable,
      'he-sky-layer--centered': centered,
      'he-sky-layer--transparent': transparent,
    });

    return ReactDOM.createPortal(
      <div ref={this._element} className={className}>
        {children}
      </div>,
      this._skyLayer
    );
  }
}
