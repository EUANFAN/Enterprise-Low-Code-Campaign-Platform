import React, { Component } from 'react';
import { Dropdown, Input, Icon, Menu } from 'antd';

const { Group } = Input;
const { Item } = Menu;

export default class FontControl extends Component {
  _handleInputChange = (event) => {
    const newValue = parseFloat(event.target.value);
    if (Number.isNaN(newValue)) {
      return;
    }

    this.props.onChange(newValue);
  };

  _handleMenuChange = ({ key }) => {
    const newValue = parseFloat(key);
    if (Number.isNaN(newValue)) {
      return;
    }

    this.props.onChange(newValue);
  };

  render() {
    const { value, options, style } = this.props;

    const dropdownMenu = (
      <Menu
        mode="inline"
        selectedKeys={[value.toString()]}
        onClick={this._handleMenuChange}
      >
        {options.map((option) => (
          <Item key={option}>{option}</Item>
        ))}
      </Menu>
    );

    return (
      <Group style={{ width: 'auto' }}>
        <Input
          value={value}
          style={style}
          size="small"
          onChange={this._handleInputChange}
          addonAfter={
            <Dropdown placement="bottomRight" overlay={dropdownMenu}>
              <Icon type="down" />
            </Dropdown>
          }
        />
      </Group>
    );
  }
}
