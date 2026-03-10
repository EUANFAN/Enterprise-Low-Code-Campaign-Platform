/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:03:11
 */
import React from 'react';
import classNames from 'classnames';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import ReactDOM from 'react-dom';
import HESkyLayer from 'components/HESkyLayer';

import './index.less';
import 'common/style/animations.less';

const TOOLTIP_SHOW_DURATION = 300;

export default class HETooltip extends React.Component {
  static defaultProps = {
    className: '',
  };

  _targetElement;
  _childComponent = React.createRef();
  state = { showPosition: null };

  componentDidMount() {
    // eslint-disable-next-line react/no-find-dom-node
    this._targetElement = ReactDOM.findDOMNode(this._childComponent.current);
    if (!this._targetElement || this._targetElement instanceof Text) {
      return;
    }

    this._targetElement.addEventListener('mouseenter', this._handleMouseEnter);
    this._targetElement.addEventListener('mouseleave', this._handleMouseLeave);
  }

  componentWillUnmount() {
    if (!this._targetElement || this._targetElement instanceof Text) {
      return;
    }

    this._targetElement.removeEventListener(
      'mouseenter',
      this._handleMouseEnter
    );
    this._targetElement.removeEventListener(
      'mouseleave',
      this._handleMouseLeave
    );
  }

  _handleMouseEnter = () => {
    this.setState({
      showPosition:
        this._targetElement && this._targetElement.getBoundingClientRect(),
    });
  };

  _handleMouseLeave = () => {
    this.setState({ showPosition: null });
  };

  render() {
    const { className: classNameFromProp, children, text } = this.props;
    const { showPosition } = this.state;

    const className = classNames(['he-tooltip', classNameFromProp]);

    return (
      <React.Fragment>
        {React.cloneElement(children, { ref: this._childComponent })}
        <HESkyLayer transparent={true} clickable={false} centered={false}>
          <TransitionGroup component={null}>
            {showPosition && (
              <CSSTransition
                classNames="animation__fade"
                appear={true}
                timeout={TOOLTIP_SHOW_DURATION}
              >
                <div
                  className={className}
                  style={{
                    top: showPosition.top,
                    left: showPosition.left + showPosition.width * 0.5,
                  }}
                >
                  {text}
                </div>
              </CSSTransition>
            )}
          </TransitionGroup>
        </HESkyLayer>
      </React.Fragment>
    );
  }
}
