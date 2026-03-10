import React, { Component } from 'react';
import { Radio } from 'antd';
import AlignLeftIcon from '../icons/AlignLeft.js';
import AlignRightIcon from '../icons/AlignRight.js';
import AlignCenterIcon from '../icons/AlignCenter.js';

const { Group, Button } = Radio;

const TextAligns = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
};

export default class AlignItems extends Component {
  static TextAligns = TextAligns;

  static defaultProps = {
    align: TextAligns.LEFT,
  };

  render() {
    const { onAlignChange, align } = this.props;

    return (
      <Group
        size="small"
        onChange={onAlignChange}
        value={align}
        style={{ width: 'auto' }}
      >
        <Button value={AlignItems.TextAligns.LEFT}>
          <AlignLeftIcon size={22} />
        </Button>
        <Button value={AlignItems.TextAligns.CENTER}>
          <AlignCenterIcon size={22} />
        </Button>
        <Button value={AlignItems.TextAligns.RIGHT}>
          <AlignRightIcon size={22} />
        </Button>
      </Group>
    );
  }
}
