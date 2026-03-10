function getPositionAndSize(widget, container) {
  let containerSize = {};
  let { align, width, height } = widget;
  let style = {
    width: widget.width,
    height: widget.height,
    left: widget.left,
    top: widget.top,
  };
  if (align !== 'free') {
    align = align.split('-');

    if (widget.location == 'screen') {
      containerSize = {
        width: 375,
        height: 603,
      };
    } else {
      containerSize = {
        width: container.width,
        height: container.height,
      };
    }

    let horizontal = align[0];
    let vertical = align[1];

    switch (horizontal) {
      case 'left':
        style.left = 0 + widget.alignLeftMargin;
        break;
      case 'center':
        // 根据屏幕宽度来定位
        style.left = 375 / 2 - width / 2;
        break;
      case 'right':
        style.left = 375 - widget.width - widget.alignRightMargin;
        break;
      default:
        break;
    }

    switch (vertical) {
      case 'top':
        style.top = 0 + widget.alignTopMargin;
        break;
      case 'center':
        style.top = containerSize.height / 2 - height / 2;
        break;
      case 'bottom':
        style.top =
          containerSize.height - widget.height - widget.alignBottomMargin;
        break;
      default:
        break;
    }
  }

  return style;
}
module.exports = getPositionAndSize;
