import React from 'react';
import classNames from 'classnames';
import HESkyLayer from 'components/HESkyLayer';
import './index.less';

export default class HEDropdown extends React.Component {
  static defaultProps = {
    className: '',
  };

  _menuContainerElement = null;
  state = { rect: null };

  componentDidMount() {
    this._updateRect();
  }

  componentDidUpdate(prevProps) {
    const { show, targetElement } = this.props;

    if (prevProps.show !== show || prevProps.targetElement !== targetElement) {
      this._updateRect();
    }
  }

  componentWillUnmount() {
    const { rect } = this.state;

    if (rect) {
      this.props.onClose();
    }
  }

  _handleMenuRef = (element) => {
    if (!this._menuContainerElement && element) {
      const rect = element.getBoundingClientRect();
      const diffXRight = rect.right - god.innerWidth;
      const diffXLeft = rect.left;
      const diffYBottom = rect.bottom - god.innerHeight;

      if (diffXRight > 0 || diffXLeft < 0 || diffYBottom > 0) {
        const translateX =
          diffXRight > 0 ? -diffXRight : diffXLeft < 0 ? -diffXLeft : 0;
        const translateY = diffYBottom > 0 ? -diffYBottom : 0;
        element.style.transform = `translate(${translateX}px, ${translateY}px)`;
      }
    }
  };

  _updateRect = () => {
    const { show, targetElement } = this.props;
    if (show && targetElement) {
      this.setState({ rect: targetElement.getBoundingClientRect() });
    } else if (targetElement) {
      this.setState({ rect: null });
    }
  };

  render() {
    const {
      children,
      className: classNameFromProp,
      show,
      width,
      menu,
      onClose,
      menuTop,
    } = this.props;
    const { rect } = this.state;
    const className = classNames([classNameFromProp, 'he-dropdown-menu']);
    const overlayWidth = width || (rect && rect.width) || 0;
    const scrollX = window.scrollX;
    return (
      <React.Fragment>
        {children}
        {show && rect && (
          <HESkyLayer
            centered={false}
            clickable={false}
            transparent={true}
            onClickAway={onClose}
          >
            <div
              ref={this._handleMenuRef}
              className={className}
              style={{
                left: rect.left + scrollX + (rect.width - overlayWidth) * 0.5,
                top: rect.top + menuTop,
                // width: overlayWidth,
                minWidth: '110px',
              }}
            >
              {/* {React.cloneElement(children, { ref: null })} */}
              {menu}
            </div>
          </HESkyLayer>
        )}
      </React.Fragment>
    );
  }
}
