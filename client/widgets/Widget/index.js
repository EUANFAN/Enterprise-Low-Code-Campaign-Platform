// 左侧缩略图
import React from 'react';
import { observer } from 'mobx-react';
import { hasHeightWidget } from 'widgets';
import classnames from 'classnames';
import ConditionUtil from 'utils/ConditionUtils';
import { runTriggers, runAnimate, getPageById, frezzPage } from 'common/utils';
import { useDataValue, px2rem } from 'utils/ModelUtils';
import { connectToStore } from 'components/StoreContext';
import WidgetClass from '../WidgetClass';
import './index.less';
import Loadable from 'react-loadable';
import loadingComponent from 'components/LoadingComponent';
const Animation = Loadable({
  loader: () => import(/* webpackChunkName: "Animation" */'components/HEAnimation'),
  loading: loadingComponent
});

@observer
class Widget extends WidgetClass {
  map = {}
  /**
   * 场景值：view表示当前组件是在展示状态下使用
   *
   * @type {String}
   */
  scene = 'view'

  static defaultProps = {
    onAction: () => { },
  }

  constructor(props) {
    super(props);
  }

  onClick = () => {
    this.dispatchTrigger('click');
  }

  onMouseDown = () => {
    this.dispatchTrigger('touchStart');
  }

  onTouchStart = () => {
    this.dispatchTrigger('touchStart');
  }

  onMouseUp = () => {
    this.dispatchTrigger('touchEnd');
  }

  onTouchEnd = () => {
    this.dispatchTrigger('touchEnd');
  }

  dispatchTrigger = (eventKey) => {
    const now = Date.now();
    if (this.map[eventKey] != null) {
      if (now - this.map[eventKey] < 100) {
        this.map[eventKey] = now;
        return;
      }
    }
    this.map[eventKey] = now;
    const { widget, onAction, store, variableMap } = this.props;
    let project = store.getProject();
    runTriggers(
      widget.triggers,
      eventKey,
      'widget',
      { dispatch: onAction, project, store },
      widget,
      variableMap
    );
  }

  componentDidMount() {
    let { widget } = this.props;
    // 切换页面时，生命周期执行情况 => 先执行第二页组件render 再执行第一页组件unmount 再执行第二页组件didMount
    if (widget.visible && widget.isFullPage) {
      frezzPage(true);
    }
    if (!god.inEditor) {
      runAnimate(widget.animations, 0, widget.id, 'In');
    }
    super.componentDidMount();
  }
  render() {
    let me = this;
    let { widget, container, store, variableMap } = me.props;
    let project = store.getProject();
    let { id, type, version, condition } = widget;
    const path = widget.path || '';
    const expression = useDataValue(condition, variableMap, getPageById(path.split('-')[0]), project, true);
    if (condition && !ConditionUtil(expression)) {
      return null;
    }
    const { width, height, location, layout, align, zIndex, left, top, visible, margin } = widget;
    let containerStyle = {
      display: visible ? 'block' : 'none'
    };
    let borderHalfStyle = '';
    let animationProps = this.getAnimation(widget);

    let contentStyle = {
      height: (layout == 'flow') ? 'auto' : '100%',
      ...this.getStyle(widget)
    };
    if (layout == 'flow') {
      if (hasHeightWidget(widget)) {
        contentStyle.height = '100%';
      }
      // 原来的代码中 只为了 getAlignStyle 只为了得到 left、top、right、bottom
      // 没有处理 并 assgin margin 的逻辑
      contentStyle.margin = margin || '0 0 0 0';
    }
    else {
      containerStyle = Object.assign(containerStyle, {
        position: 'absolute',
        height: height,
        width: width
      });
    }
    let offset = 0;
    // 在预览状态下，页面下的组件 且 基于屏幕定位的 才会有偏移
    if (god.inPreview && location == 'screen') {
      containerStyle.position = 'fixed';
      containerStyle.margin = '0 auto';
      containerStyle.zIndex = zIndex || 200;
      if (container.clazz == 'page') {
        offset = (god.clientSize.width - god.stageSize.width) / 2;
        offset = offset * 37.5 / (god.rem || 37.5);
      }
    }
    // 组件使用left|top|right|bottom 的方式 是什么？
    if (layout == 'flow') {
      if (location == 'screen' && widget.align != 'free') {
        let alignStyle = align ? this.getAlignStyle(offset) : {};
        Object.assign(containerStyle, alignStyle);
      }
    } else {
      if (align == 'free') {
        containerStyle.left = left + offset;
        containerStyle.top = top;
      }
      else {
        let alignStyle = align ? this.getAlignStyle(offset) : {};
        Object.assign(containerStyle, alignStyle);
      }
    }

    if (widget.isFullPage) {
      containerStyle = Object.assign(containerStyle, {
        position: 'fixed',
        height: '100vh',
        width: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      });
    }
    let content = this.getWidgetContent(type, version);
    px2rem(contentStyle);
    let contentWrapper = (
      <div
        className={classnames([`widget_${type}`, `content${borderHalfStyle && ` ${borderHalfStyle}`}`])}
        style={contentStyle}
      >
        {content}
      </div>
    );

    let parentId = null;
    // zhangyan 这里是否还有必要
    // 针对文本设置自动调整高度后不设置高度，由内容撑开
    if (widget.data && widget.data.autoHeight && (widget.type == 'NormalText' || widget.type == 'RichText')) {
      delete containerStyle.height;
    }
    px2rem(containerStyle);
    return (
      <div
        className={classnames(['widget', 'widget_' + type, 'widget_' + id])}
        style={containerStyle}
        onClick={e => me.onClick(id, parentId, e)}
        onTouchStart={e => me.onTouchStart(id, parentId, e)}
        onTouchEnd={e => me.onTouchEnd(id, parentId, e)}
        onMouseDown={e => me.onMouseDown(id, parentId, e)}
        onMouseUp={e => me.onMouseUp(id, parentId, e)}
        ref={node => {
          me.ele = node;
        }}
      >
        {
          Object.keys(animationProps).length
            ? <Animation {...animationProps} widget={widget}>
              {contentWrapper}
            </Animation>
            : <React.Fragment>{contentWrapper}</React.Fragment>
        }
      </div>
    );
  }
}

export default connectToStore(Widget);
