import React from 'react';
import { observer } from 'mobx-react';
import { px2rem, getBackgroundImageAttribute } from 'utils/ModelUtils';

@observer
class Container extends React.Component {
  static defaultProps = {
    onAction: () => {},
  };

  constructor(props) {
    // 建立对子节点的引用
    super(props);
    this.widgets = [];
  }

  getWidget = (widget) => {
    let me = this;
    let container = me.props.container;
    let Widget = this.WidgetClass;
    return (
      <Widget
        getRef={(node) => {
          me.widgets.push(node);
        }}
        key={widget.id}
        widget={widget}
        fromLayer={me.fromLayer}
        onAction={this.props.onAction}
        container={container}
        variableMap={me.props.variableMap}
      />
    );
  };

  renderWidgets = function (layoutWidgets, iterator) {
    let me = this;
    return layoutWidgets.map(function (widget, index) {
      if (typeof iterator == 'function') {
        iterator(widget, index);
      }
      return me.getWidget(widget);
    });
  };

  getHighestWidget() {
    const { widgets } = this.props;
    let offsetTops = [100];
    widgets.forEach((widget) => {
      const { location, layout, top, height } = widget;
      if (location == 'screen' || layout == 'flow') {
        return;
      }
      offsetTops.push(top + height);
    });

    return Math.max.apply(null, offsetTops);
  }
  render() {
    let me = this;
    const { widgets, store, container, hideWigets } = this.props;
    let project = store ? store.getProject() : {};
    const {
      width: containerWidth,
      height: containerHeight,
      bgColor: containerBgColor,
    } = container;
    let flowLayout = [];
    let normalLayout = [];
    if (hideWigets) {
      // 服务端不渲染
      if (god.inPreview || typeof window === 'undefined') {
        return null;
      }
      return (
        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          请右键点击进入后配置内容
        </div>
      );
    }
    widgets.map((widget) => {
      const { visible, layout } = widget;
      if (!widget.required && !visible) {
        return;
      }
      if (layout == 'normal') {
        normalLayout.push(widget);
      } else {
        flowLayout.push(widget);
      }
    });

    // 获取瀑布流布局组件
    let flowWidgets = me.renderWidgets(flowLayout);
    // 获取拖拽布局组件
    let normalWidgets = me.renderWidgets(normalLayout);

    let containerStyle = {
      backgroundColor: containerBgColor,
      position: 'relative',
    };
     // project.stageWidth 为 true s说明是自定义宽度，取自定义宽度，否则取页面宽度
    if(project.stageWidth) {
      containerStyle.maxWidth = project.maxWidth;
    }
    Object.assign(
      containerStyle,
      getBackgroundImageAttribute(container, project)
    );
    if (container.isFullPage) {
      containerStyle.width = god.inEditor ? '100%' : '100vw';
      containerStyle.height = god.inEditor ? '100%' : '100vh';
      containerStyle.overflow = 'hidden';
      containerStyle.inset = 'auto';
      containerStyle.top = 0;
      containerStyle.left = 0;
      containerStyle.right = 0;
      containerStyle.bottom = 0;
      if (container.screen) {
        containerStyle.zIndex = 100;
      }
    } else {
      if (container.clazz === 'page') {
        // if(project.pageTransition != 'none') {
        // 此处 absolute 影响了页面间的动效
        containerStyle.position = 'absolute';
        // }
        containerStyle.left = 0;
        containerStyle.right = 0;
        containerStyle.margin = '0 auto';
        containerStyle.width = god.inEditor ? '100%' : '100vw';
        containerStyle.maxWidth = containerStyle['maxWidth'] || '375px';
        // 文本的高度在小屏幕上会超出
        containerStyle.overflowX = 'hidden';
        containerStyle.minHeight = '100vh';
      } else if (container.clazz === 'layer') {
        containerStyle.minHeight = containerHeight;
      }
    }

    let flowContainerStyle;
    // 全屏页面情况下瀑布流布局容器样式与页面样式保持一致
    if (container.isFullPage) {
      flowContainerStyle = {
        width: containerStyle.width,
        height: containerStyle.height,
        minHeight: containerStyle.minHeight,
      };
    }
    // 滚屏页面情况下瀑布流布局需要自动撑开
    else {
      if (container.clazz == 'page') {
        flowContainerStyle = {
          width: containerStyle['maxWidth'] || containerWidth,
          position: 'relative',
        };
      }
    }

    let isLayer = container.clazz === 'layer';
    px2rem(containerStyle);
    px2rem(flowContainerStyle);
    return (
      <div
        id={container.id}
        className={['container', me.props.className].join(' ')}
        style={containerStyle}
      >
        {god.inEditor &&
          !god.inPreview &&
          isLayer &&
          flowWidgets.length == 0 &&
          normalWidgets.length == 0 && (
            <div style={{ textAlign: 'center', paddingTop: '20px' }}>
              请右键点击进入后配置内容
            </div>
          )}
        {flowWidgets.length > 0 && (
          <div className="flow-wrapper" style={flowContainerStyle}>
            {flowWidgets}
          </div>
        )}
        {normalWidgets.length > 0 && normalWidgets}
      </div>
    );
  }
}

export default Container;
