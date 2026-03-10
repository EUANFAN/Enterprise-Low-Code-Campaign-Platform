import store from 'store/stage';
import throttle from 'lodash/throttle';
import { PAGE_HEIGHT } from 'common/constants';

let CURRENT_STAGE_HEIGHT = PAGE_HEIGHT;
let firstEnter = true;
let bottomestElementId = null;
let DEFAULT_PAGE_HEIGHT = PAGE_HEIGHT;
// 计算选中元素尺寸
const computeSelectHeight = (stage, selected) => {
  let top = 0;
  let lastMagin = 0;
  stage.list.some((widget) => {
    let margin = getMargin(widget.margin);
    if (widget.id != selected.id && widget.visible && widget.layout == 'flow') {
      let height =
        Math.max(margin.top, lastMagin) -
        lastMagin +
        margin.bottom +
        widget.height;
      top += height;
      lastMagin = margin.bottom;
    }
    if (widget.id == selected.id) {
      top += Math.max(margin.top, lastMagin) - lastMagin;
    }
    return widget.id == selected.id;
  });
  return {
    width: selected.width,
    height: selected.height,
    left: selected.left,
    top: top,
  };
};
// 计算流式布局元素的相对尺寸
const computedFlowRelativeScale = throttle(computeSelectHeight, 200);
// 计算图片原始宽高比例
let getImageOriginScaleByUrl = (url) => {
  let image = new Image();
  image.src = url;
  return new Promise((resolve) => {
    image.onload = () => {
      resolve(image.width / image.height);
    };
    image.onerror = () => {
      resolve(null);
    };
  });
};
let getflowWidgets = (widgets) => {
  // widget.location = 'screen' 是fix定位
  return widgets.filter((widget) => {
    return (
      widget.layout === 'flow' && widget.visible && widget.location != 'screen'
    );
  });
};
let getNormalWidgets = (widgets) => {
  return widgets.filter(
    (widget) =>
      widget.layout === 'normal' && widget.visible && widget.location === 'page'
  );
};
let getMaxNormalHeightWidget = (widgets) => {
  return widgets.reduce(
    (lastMaxWidget, curWidget) => {
      let curWidgetHeight = curWidget.top + curWidget.height;
      if (lastMaxWidget.height >= curWidgetHeight) {
        return lastMaxWidget;
      } else {
        return {
          widget: curWidget,
          height: curWidgetHeight,
        };
      }
    },
    {
      widget: {
        top: 0,
        height: 0,
      },
      height: 0,
    }
  );
};
let getFlowWidgetsMargin = (widgets) => {
  // margin存在外边距合并问题
  return widgets.reduce(
    (prevAll, widget) => {
      const margin = getMargin(widget.margin);
      return {
        margin:
          prevAll.margin +
          margin.bottom +
          Math.max(prevAll.marginBottom, margin.top) -
          prevAll.marginBottom,
        marginBottom: margin.bottom,
      };
    },
    {
      margin: 0,
      marginBottom: 0,
    }
  );
};
let getFlowWidgetsContentHeight = (widgets) => {
  return widgets.reduce((allHeight, curWidget) => {
    return allHeight + curWidget.height;
  }, 0);
};
let getFlowWidgetsHeight = (widgets) => {
  return (
    getFlowWidgetsMargin(widgets).margin + getFlowWidgetsContentHeight(widgets)
  );
};
// 自动调整高度计算
let computedContentHeight = (widgets, type, noNeedAgainCompute) => {
  DEFAULT_PAGE_HEIGHT = type === 'page' ? PAGE_HEIGHT : 50;
  if (!CURRENT_STAGE_HEIGHT) {
    CURRENT_STAGE_HEIGHT = DEFAULT_PAGE_HEIGHT;
  }
  if (!noNeedAgainCompute || firstEnter) {
    firstEnter = false;
    if (widgets.length <= 0) {
      return DEFAULT_PAGE_HEIGHT;
    }
    let normalWidgets = getNormalWidgets(widgets);
    let flowWidgets = getflowWidgets(widgets);
    let normalHeightWidget = getMaxNormalHeightWidget(normalWidgets);
    let maxNormalHeight = normalHeightWidget.height;
    let flowWidgetsHeight = getFlowWidgetsHeight(flowWidgets);
    let height;
    if (maxNormalHeight > flowWidgetsHeight) {
      height = maxNormalHeight;
      bottomestElementId = normalHeightWidget.widget.id;
    } else {
      height = flowWidgetsHeight;
      bottomestElementId = null;
    }
    if (height > DEFAULT_PAGE_HEIGHT) {
      CURRENT_STAGE_HEIGHT = height;
    } else {
      CURRENT_STAGE_HEIGHT = DEFAULT_PAGE_HEIGHT;
      bottomestElementId = null;
    }
  }
  return CURRENT_STAGE_HEIGHT;
};
// 获取元素margin值
let getMargin = (margin) => {
  let result = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  };
  (margin || '').split(/\s+/).forEach((item, index) => {
    switch (index) {
      case 0:
        result.top = Number(item);
        break;
      case 1:
        result.right = Number(item);
        break;
      case 2:
        result.bottom = Number(item);
        break;
      default:
        result.left = Number(item);
    }
  });
  return result;
};
// 选中多个元素时，计算最大尺寸
let computedMaxSize = (widgets) => {
  return widgets.reduce(
    (totalSize, widget) => {
      let rightestWidget =
        totalSize.rightestWidget.left + totalSize.rightestWidget.width >
        widget.left + widget.width
          ? totalSize.rightestWidget
          : widget;
      let bottomestWidget =
        totalSize.bottomestWidget.top + totalSize.bottomestWidget.height >
        widget.top + widget.height
          ? totalSize.bottomestWidget
          : widget;
      let minLeft =
        totalSize.left !== undefined
          ? Math.min(totalSize.left, widget.left)
          : widget.left;
      let minTop =
        totalSize.top !== undefined
          ? Math.min(totalSize.top, widget.top)
          : widget.top;
      return {
        left: minLeft,
        top: minTop,
        rightestWidget: rightestWidget,
        bottomestWidget: bottomestWidget,
        width: rightestWidget.left + rightestWidget.width - minLeft,
        height: bottomestWidget.top + bottomestWidget.height - minTop,
      };
    },
    {
      width: 0,
      height: 0,
      bottomestWidget: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      rightestWidget: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
    }
  );
};
let haveFlowWidgets = (widgets) => {
  return widgets.some((item) => {
    return item.layout != 'normal';
  });
};
// 计算选中元素的相对位置，方便在刻度尺上展示
let getSelectChildrenSize = (selectChildren) => {
  // 如果只选中一个流式布局元素，computedFlowRelativeScale
  // 如果选中多个普通布局元素，computedMaxSize
  // 如果选中多个元素中有流式布局元素，不计算
  let stageStore = store.getStageStore();
  let stage = stageStore.getCurrentStage();
  let selectScale = null;
  if (selectChildren.length == 1) {
    selectScale = selectChildren[0];
    if (selectScale.layout === 'flow') {
      selectScale = computedFlowRelativeScale(stage, selectScale);
    }
  } else {
    let isHaveFlowWidgetsFlag = haveFlowWidgets(selectChildren);
    if (!isHaveFlowWidgetsFlag) {
      selectScale = computedMaxSize(selectChildren);
    }
  }
  return selectScale;
};
let isHaveWidget = (selectWidgetId, list) => {
  return list.some((widget) => {
    return selectWidgetId == widget.id;
  });
};
let noNeedAgainComputeHeight = (widgets) => {
  let maxSize = computedMaxSize(widgets);
  let height = maxSize.bottomestWidget.top + maxSize.bottomestWidget.height;
  // 这里需要计算 当前元素的距离底部的距离和上一次最底部的元素距离进行比较
  if (height < DEFAULT_PAGE_HEIGHT) {
    return true;
  }
  if (bottomestElementId && isHaveWidget(bottomestElementId, widgets)) {
    return false;
  }
  if (height >= CURRENT_STAGE_HEIGHT) {
    return false;
  }

  return true;
};
// 滚动到某个元素 计算当前元素的位置
let scrollToWidget = (stage, selectChildren) => {
  // 获取当前元素的top值
  let widgetPosition = 0;
  if (selectChildren.layout == 'normal') {
    widgetPosition = selectChildren.top + selectChildren.height;
  } else {
    let position = computedFlowRelativeScale(stage, selectChildren);
    widgetPosition = position.top + position.height;
  }
  // 判断可视区域高度 屏幕的高度-100-60
  let parentNode = document.querySelector('.viewport-current').parentNode;
  let visibleHeight = document.body.scrollHeight - 100 - 60;
  // 当前选中的元素的top + height 是否在可视区域高度内，不在的话取差值 50是一个视线缓冲区
  let diff = widgetPosition - visibleHeight + 50;
  if (diff > 0) {
    if (parentNode) parentNode.scroll(0, diff);
  } else {
    if (parentNode) parentNode.scroll(0, 0);
  }
};
export {
  getImageOriginScaleByUrl,
  getFlowWidgetsHeight,
  computedContentHeight,
  computedMaxSize,
  getSelectChildrenSize,
  noNeedAgainComputeHeight,
  scrollToWidget,
  getMargin,
};
