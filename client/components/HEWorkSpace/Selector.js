import React from 'react';
import { observer } from 'mobx-react';
import './Selector.less';
import getAncestor from 'common/getAncestor';

const THRESHOLD_AREA = 5;

@observer
class Selector extends React.Component {
  state = {
    mouseDown: false,
    startPoint: null,
    endPoint: null,
    offset: null,
  };

  componentDidMount() {
    god.document.addEventListener('mousedown', this.onMouseDown);
  }

  /**
   * On root element mouse down
   *
   * @private
   */
  onMouseDown = (e) => {
    let target = e.target;
    if (target.tagName === 'CANVAS') {
      return false;
    }
    let ancestor = getAncestor(target, 'widget-wrapper');
    let ancestorMask = getAncestor(target, 'widget-box-mask');
    let workspace = getAncestor(target, 'workspace');
    // 非左键事件 直接忽略
    if (e.button != 0) {
      return;
    }

    let offsetParent = this.selectionContainer?.offsetParent;
    if(offsetParent == null) return;
    let rect = offsetParent.getClientRects()[0];
    let offset = {
      x: rect.left,
      y: rect.top,
      width: offsetParent.offsetWidth,
      height: offsetParent.offsetHeight,
    };

    this.offset = offset;
    if (
      ancestor ||
      ancestorMask ||
      !workspace ||
      e.pageX < offset.x + 1 ||
      e.pageX > offset.x + offset.width ||
      e.pageY < offset.y + 1 ||
      e.pageY > offset.y + offset.height
    ) {
      return;
    }

    this.setState({
      mouseDown: true,
      startPoint: {
        x: e.pageX - offset.x + offsetParent.scrollLeft,
        y: e.pageY - offset.y + offsetParent.scrollTop,
      },
    });
    god.document.addEventListener('mousemove', this.onMouseMove);
    god.document.addEventListener('mouseup', this.onMouseUp);
  };

  /**
   * On document element mouse up
   * @private
   */
  onMouseUp = (e) => {
    god.document.removeEventListener('mousemove', this.onMouseMove);
    god.document.removeEventListener('mouseup', this.onMouseUp);

    const { startPoint, endPoint } = this.state;

    if (
      startPoint &&
      endPoint &&
      Math.abs(startPoint.x - endPoint.x) *
        Math.abs(startPoint.y - endPoint.y) >
        THRESHOLD_AREA
    ) {
      this.props.onSelectionChange(startPoint, endPoint, e.metaKey);
      e.stopPropagation();
    }

    this.setState({
      mouseDown: false,
      startPoint: null,
      endPoint: null,
    });
  };

  /**
   * On document element mouse move
   * @private
   */
  onMouseMove = (e) => {
    e.preventDefault();
    let offset = this.offset;
    let offsetParent = this.selectionContainer?.offsetParent;
    if(offsetParent == null) return;
    if (this.state.mouseDown) {
      let x;
      if (e.pageX > offset.width + offset.x) {
        x = offset.width + offsetParent.scrollLeft;
      } else if (e.pageX < offset.x) {
        x = 0;
      } else {
        x = e.pageX - offset.x + offsetParent.scrollLeft;
      }

      let y;
      if (e.pageY > offset.height + offset.y) {
        y = offset.height + offsetParent.scrollTop;
      } else if (e.pageY < offset.y) {
        y = 0;
      } else {
        y = e.pageY - offset.y + offsetParent.scrollTop;
      }

      const endPoint = {
        x,
        y,
      };

      this.setState({
        endPoint,
      });
    }
  };

  render() {
    let masker;
    let style;
    if (this.state.startPoint && this.state.endPoint) {
      style = {
        left: Math.min(this.state.startPoint.x, this.state.endPoint.x),
        top: Math.min(this.state.startPoint.y, this.state.endPoint.y),
        width: Math.abs(this.state.endPoint.x - this.state.startPoint.x),
        height: Math.abs(this.state.endPoint.y - this.state.startPoint.y),
      };
      masker = <div className="selector-masker" style={style} />;
    }

    return (
      <div
        className="selector-container"
        style={style ? { zIndex: 10000 } : {}}
        ref={(node) => {
          this.selectionContainer = node;
        }}
      >
        {masker}
      </div>
    );
  }
}

export default Selector;
