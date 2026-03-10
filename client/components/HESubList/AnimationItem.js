import React from 'react';
import { Button, Icon } from 'antd';
import { observer } from 'mobx-react';
import base from 'base';
import state from 'store/animation';
import MoveWidgetOperation from 'components/HEMoveWidgetOperation';
import ControlWrap from 'controls/ControlWrap';

@observer
class AnimationItem extends React.Component {
  play = () => {
    let me = this;
    let animation = me.props.sub;
    let widget = me.props.widget;
    let id = widget.id;
    state.animation.widgetId = null;
    if (animation.animationType !== 'hash' || animation.type !== 'none') {
      setTimeout(function () {
        state.animation['widget' + id] = animation;
        state.animation.widgetId = id;
      }, 0);
    }
  };

  render() {
    let me = this;
    let type = 'animation';
    let animation = me.props.sub;
    let project = me.props.project;

    return (
      <div className="sub-item">
        <ControlWrap
          key={animation.id}
          WidgetConfig={base[type]}
          project={project}
          element={animation}
        >
        </ControlWrap>
        <div style={{ margin: '0px 15px 10px' }}>
          <Button onClick={me.play} style={{ width: '100%' }}>
            {'播放动画'}
          </Button>
        </div>
        <MoveWidgetOperation options={this.props.moveWidgetOptions} />
        <Icon
          type="close"
          className="close"
          onClick={() => me.props.onDelete(animation)}
        />
      </div>
    );
  }
}
export default AnimationItem;
