import './CanvasRuler.less';

import React from 'react';
import { observer } from 'mobx-react';

@observer
class CanvasRuler extends React.Component {
  state = {
    devicePixelRatio: 1,
  };
  render() {
    let me = this;
    let props = this.props;

    let { direction, offsetLeft, offsetTop, pageSize, scale: oScale } = props;

    let scale = oScale;

    let className, offset, style;
    // 负数标尺距离
    const MINUS_SCALE = 600;
    if (direction == 'horizontal') {
      offset = offsetLeft ? offsetLeft : 0;
      className = 'canvasW';
      style = {
        left: offset - MINUS_SCALE,
        width: 1800,
        height: 30,
      };
    } else if (direction == 'vertical') {
      className = 'canvasH';
      style = {
        height: pageSize.height + MINUS_SCALE,
        width: 30,
        top: -offsetTop || 0,
      };
    }

    if (!scale) {
      scale = {};
    }

    return (
      <canvas
        ref={(node) => {
          me.canvas = node;
        }}
        left={scale.left}
        top={scale.top}
        s_width={scale.width}
        s_height={scale.height}
        className={className}
        style={style}
      ></canvas>
    );
  }

  componentDidMount() {
    this.setState({
      devicePixelRatio: god.devicePixelRatio,
    });
    this.drawRuler();
    this.drawRulerScale();
  }

  componentDidUpdate() {
    this.drawRuler();
    this.drawRulerScale();
  }

  drawRuler = () => {
    let canvas = this.canvas;
    let ctx = canvas.getContext('2d');
    let props = this.props;
    let { direction, pageSize } = props;
    let devicePixelRatio = this.state.devicePixelRatio;
    if (direction == 'horizontal') {
      // 横尺
      canvas.width = 1800 * devicePixelRatio;
      canvas.height = 30 * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, 800 * devicePixelRatio, 30 * devicePixelRatio);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 1800 * devicePixelRatio, 15);
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.strokeStyle = '#333';
      ctx.moveTo(0, 15);
      ctx.lineTo(1800 * devicePixelRatio, 15);
      ctx.save();
      ctx.fillStyle = '#666';
      // 画刻度
      for (let i = 0; i < canvas.width / 100; i++) {
        ctx.moveTo(i * 100, 5); // 画大刻度
        ctx.lineTo(i * 100, 15);

        ctx.font = '10px PingFang';
        ctx.fillText(i * 100 - 600, i * 100 + 2, 10);

        for (let j = 1; j <= 9; j++) {
          ctx.moveTo(i * 100 + j * 10, 9); // 画小刻度
          ctx.lineTo(i * 100 + j * 10, 15);
        }
      }
      ctx.stroke();
    } else if (direction == 'vertical') {
      // 竖尺
      canvas.width = 30 * devicePixelRatio;
      canvas.height = (pageSize.height + 600) * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, 30, (pageSize.height + 600) * devicePixelRatio);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 16, (pageSize.height + 600) * devicePixelRatio);
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.strokeStyle = '#333';
      ctx.moveTo(16, 0);
      ctx.lineTo(16, (pageSize.height + 600) * devicePixelRatio);
      ctx.save();
      ctx.fillStyle = '#666';
      // 画刻度
      for (let a = 0; a < canvas.height / 100; a++) {
        ctx.moveTo(6, a * 100);
        ctx.lineTo(16, a * 100);
        // 旋转文字
        ctx.save();
        ctx.translate(10, a * 100 - 2);
        ctx.rotate(-Math.PI / 2);
        ctx.font = '10px PingFang';
        ctx.fillText(a * 100 - 100, 0, 0);
        ctx.restore();

        for (var b = 1; b <= 9; b++) {
          ctx.moveTo(10, a * 100 + b * 10);
          ctx.lineTo(16, a * 100 + b * 10);
        }
      }
      ctx.stroke();
    }
  };

  drawRulerScale() {
    let me = this;
    let { direction, scale } = me.props;

    // canvas画阴影
    let canvas = me.canvas;
    let ctx = canvas.getContext('2d');
    if (direction == 'horizontal' && scale) {
      let { width, left } = scale;
      left = left && Math.round(left);
      width = width && Math.round(width);
      ctx.font = '14px PingFang';
      ctx.fillStyle = '#4A82F7';
      ctx.fillText(left, 600 + left - 4, 27);
      ctx.fillText(left + width, 600 + left + width - 20, 27);
      ctx.fillStyle = '#111';
      ctx.globalAlpha = 0.2;
      ctx.fillRect(600 + left, 0, width, 15);
    } else if (direction == 'vertical' && scale) {
      let { top, height } = scale;
      top = top && Math.round(top);
      height = height && Math.round(height);
      // 旋转文字
      ctx.save();
      ctx.translate(8, 100 + top + 8);
      ctx.rotate(-Math.PI / 2);
      ctx.font = '14px PingFang';
      ctx.fillStyle = '#4A82F7';
      ctx.fillText(top, 2, 20);
      ctx.restore();

      ctx.save();
      ctx.translate(8, 100 + top + height + 8);
      ctx.rotate(-Math.PI / 2);
      ctx.font = '14px PingFang';
      ctx.fillStyle = '#4A82F7';
      ctx.fillText(top + height, 0, 20);
      ctx.restore();

      ctx.fillStyle = '#111';
      ctx.globalAlpha = 0.2;
      ctx.fillRect(0, 100 + top, 16, height);
    }
  }
}

export default CanvasRuler;
