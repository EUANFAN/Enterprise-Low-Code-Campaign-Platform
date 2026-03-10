import React from 'react';
import { observer } from 'mobx-react';
import store from 'store/stage';

// 水平
import AlignLeft from 'components/icons/AlignLeft';
import AlignCenter from 'components/icons/AlignCenter';
import AlignRight from 'components/icons/AlignRight';
// 垂直
import VerticalTop from 'components/icons/VerticalTop';
import VerticalCenter from 'components/icons/VerticalCenter';
import VerticalBottom from 'components/icons/VerticalBottom';

import './index.less';

@observer
class HEOperationList extends React.Component {
  getWidgetsBounds = (widgets) => {
    let clip;

    widgets.forEach(function (widget, index) {
      if (index == 0) {
        clip = {
          top: widget.top,
          left: widget.left,
          bottom: widget.top + widget.height,
          right: widget.left + widget.width,
          height: widget.height,
          width: widget.width,
        };
      } else {
        clip.top = Math.min(clip.top, widget.top);
        clip.bottom = Math.max(clip.bottom, widget.top + widget.height);
        clip.left = Math.min(clip.left, widget.left);
        clip.right = Math.max(clip.right, widget.left + widget.width);
        clip.width = clip.right - clip.left;
        clip.height = clip.bottom - clip.top;
      }
    });

    if (clip) {
      clip.top = Math.ceil(clip.top);
      clip.left = Math.ceil(clip.left);
      clip.height = Math.ceil(clip.height);
      clip.width = Math.ceil(clip.width);
    }

    return clip;
  };

  adjust = (type) => {
    let me = this;
    let stageStore = store.getStageStore();
    let stage = stageStore.getCurrentStage();
    let widgets = stage.getSelectedChildren();
    let core;

    if (!widgets.length) {
      return;
    }

    if (widgets.length == 1) {
      core = {
        middle: Math.round(stage.component.height / 2),
        center: Math.round(stage.component.width / 2),
        right: stage.component.width,
        left: 0,
        top: 0,
        bottom: stage.component.height,
      };
    }

    if (type == 'top') {
      let top = Math.min.apply(
        Math,
        widgets.map((widget) => widget.top)
      );
      if (core) {
        top = core.top;
      }
      widgets.forEach((widget) => {
        widget.top = top;
      });
    } else if (type == 'middle') {
      let bounds = me.getWidgetsBounds(widgets);
      let middle = Math.round((bounds.top + bounds.height) / 2);

      if (core && core.middle) {
        middle = core.middle;
      }

      widgets.forEach((widget) => {
        widget.top = Math.round(middle - widget.height / 2 - 1);
      });
    } else if (type == 'bottom') {
      let bottom = Math.max.apply(
        Math,
        widgets.map((widget) => widget.top + widget.height)
      );
      if (core) {
        bottom = core.bottom;
      }
      widgets.forEach((widget) => {
        widget.top = bottom - widget.height;
      });
    } else if (type == 'left') {
      let left = Math.min.apply(
        Math,
        widgets.map((widget) => widget.left)
      );
      if (core) {
        left = core.left;
      }
      widgets.forEach((widget) => {
        widget.left = left;
      });
    } else if (type == 'center') {
      let bounds = me.getWidgetsBounds(widgets);
      let center = Math.round((bounds.left + bounds.width) / 2);

      if (core && core.center) {
        center = core.center;
      }

      widgets.forEach((widget) => {
        widget.left = Math.round(center - widget.width / 2 - 1);
      });
    } else if (type == 'right') {
      let right = Math.max.apply(
        Math,
        widgets.map((widget) => widget.left + widget.width)
      );
      if (core) {
        right = core.right;
      }
      widgets.forEach((widget) => {
        widget.left = right - widget.width;
      });
    }
  };

  render() {
    let me = this;
    let stageStore = store.getStageStore();
    let stage = stageStore.getCurrentStage();

    let alignDisabled = '';

    // TODO：此处的不可点击状态 是在视觉上 和 点击上分开处理的，待设置统一的状态
    if (!stage.getSelectedChildren().length) {
      alignDisabled = 'align-diabled';
    } else {
      stage.getSelectedChildren().forEach((widget) => {
        if (widget.locked || widget.layout === 'flow') {
          alignDisabled = 'align-diabled';
        }
      });
    }

    return (
      <div className="operation-list">
        {/* 未加功能，暂时左对齐功能 */}
        {/* <div
          className='operation-item align-diabled'
          title={'水平均分'}
        >
          <AlignCenterVerticalCenter />
        </div>

        <div
          className='operation-item align-diabled'
          title={'垂直均分'}
        >
          <VerticalCenterAlignCenter />
        </div> */}

        {/* 水平*/}
        <div
          className={'operation-item' + ' ' + alignDisabled}
          title={'左对齐'}
          onClick={() => me.adjust('left')}
        >
          <AlignLeft type="zuoduiqi" />
        </div>
        <div
          className={'operation-item' + ' ' + alignDisabled}
          title={'垂直居中对齐'}
          onClick={() => me.adjust('center')}
        >
          <AlignCenter type="chuizhijuzhong" />
        </div>
        <div
          className={'operation-item' + ' ' + alignDisabled}
          title={'右对齐'}
          onClick={() => me.adjust('right')}
        >
          <AlignRight type="youduiqi" />
        </div>

        {/* 垂直*/}
        <div
          className={'operation-item' + ' ' + alignDisabled}
          title={'上对齐'}
          onClick={() => me.adjust('top')}
        >
          <VerticalTop type="shangduiqi" />
        </div>
        <div
          className={'operation-item' + ' ' + alignDisabled}
          title={'水平居中对齐'}
          onClick={() => me.adjust('middle')}
        >
          <VerticalCenter type="shuipingjuzhong" />
        </div>
        <div
          className={'operation-item' + ' ' + alignDisabled}
          title={'下对齐'}
          onClick={() => me.adjust('bottom')}
        >
          <VerticalBottom type="xiaduiqi" />
        </div>
      </div>
    );
  }
}

export default HEOperationList;
