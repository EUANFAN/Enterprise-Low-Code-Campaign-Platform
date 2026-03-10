import React from 'react';
import { VelocityComponent } from 'velocity-react';
import 'velocity-animate';
import 'velocity-animate/velocity.ui';

const DEFAULT_LOOP = 1;

/**
 * Animation component. This is a wrapper over VelocityReact component.
 * Since VelocityReact did not passing the loop argument correctly, this is
 * needed to perform animation loop.
 */
export default class Animation extends React.Component {
  constructor(props) {
    super(props);
    this._loop = props.loop || DEFAULT_LOOP;
    this._velocity = null;
    this.state = {
      visible: true,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.loop !== nextProps.loop) {
      this._loop = nextProps.loop || DEFAULT_LOOP;
    }
  }

  _onComplete = () => {
    const { widget, scene } = this.props;
    this._loop--;
    if (this._loop > 0 && this._velocity) {
      this._velocity.runAnimation();
    }
    if (scene == 'Out' && widget) {
      widget.visible = false;
    }
  };
  UNSAFE_componentWillMount() {
    const { widget, delay, scene } = this.props;
    if (scene == 'In' && widget && delay) {
      this.setState({
        visible: false,
      });
      setTimeout(() => {
        this.setState({
          visible: true,
        });
      }, delay);
    }
  }
  render() {
    const { duration, children, animation, delay, ...others } = this.props;
    if (!duration) {
      return children || null;
    }
    if (animation !== 'transition.noneIn') {
      return (
        <div
          style={{
            visibility: this.state.visible ? 'visible' : 'hidden',
            height: '100%',
          }}
        >
          <VelocityComponent
            ref={(component) => {
              this._velocity = component;
            }}
            complete={this._onComplete}
            duration={duration}
            delay={delay}
            runOnMount={true}
            animation={animation}
            {...others}
          >
            {children}
          </VelocityComponent>
        </div>
      );
    } else {
      return (
        <VelocityComponent
          ref={(component) => {
            this._velocity = component;
          }}
          // complete={this._onComplete}
          duration={duration}
          runOnMount={true}
          // animation={animation}
          {...others}
        >
          {children}
        </VelocityComponent>
      );
    }
  }
}
