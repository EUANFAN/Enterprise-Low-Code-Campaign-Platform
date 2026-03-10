import React, { Fragment, Component } from 'react';
import {
  DEFAULT_TEXT_ALIGN,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_FONT_SIZE,
  DEFAULT_COLOR,
  DEFAULT_COLOR_ALPHA,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_BACKGROUND_COLOR_ALPHA,
} from '../constants';
import AlignControl from './AlignControl.js';
import FontControl from './FontControl.js';
import NumberInput from './NumberInput.js';
import { Button, Menu, Dropdown, Icon, InputNumber } from 'antd';
const { Item } = Menu;

import ColorPicker from 'rc-color-picker';
import 'rc-color-picker/assets/index.css';

import OrderedListIcon from '../icons/ordered-list.svg';
import UnorderedListIcon from '../icons/unordered-list.svg';
import ColorText from '../icons/ColorText.js';
import ColorFill from '../icons/ColorFill.js';
const { Group: ButtonGroup } = Button;

export default class Toolbar extends Component {
  static defaultProps = {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontWeight: DEFAULT_FONT_WEIGHT,
    fontSize: DEFAULT_FONT_SIZE,
    lineHeight: DEFAULT_LINE_HEIGHT,
    textAlign: DEFAULT_TEXT_ALIGN,
    color: DEFAULT_COLOR,
    colorAlpha: DEFAULT_COLOR_ALPHA,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
    backgroundColorAlpha: DEFAULT_BACKGROUND_COLOR_ALPHA,
  };

  _handleOrderedListClick = ({ key }) => {
    this.props.onListClick(event, 'ol_list', key);
  };

  _handleUnorderedListClick = (event) => {
    this.props.onListClick(event, 'ol_list', 'circle');
  };

  render() {
    const {
      fonts,
      fontSizes,
      lineHeights,

      fontFamily,
      fontWeight,
      fontSize,
      lineHeight,
      textAlign,
      color,
      colorAlpha,
      backgroundColor,
      backgroundColorAlpha,

      listIndent,
      listDecoratorSize,
      listPadding,

      onFontFamilyChange,
      onFontWeightChange,
      onFontSizeChange,
      onLineHeightChange,
      onTextAlignChange,
      onColorChange,
      onBackgroundColorChange,
      onListIndentChange,
      onListDecoratorSizeChange,
      onListPaddingChange,
    } = this.props;

    return (
      <div className="rich-text-editor__toolbar" style={{ display: 'flex' }}>
        <FontControl
          fonts={fonts}
          onFontFamilyChange={onFontFamilyChange}
          onFontWeightChange={onFontWeightChange}
          fontFamily={fontFamily}
          fontWeight={fontWeight}
        />
        <NumberInput
          style={{ width: 84 }}
          value={fontSize}
          options={fontSizes}
          onChange={onFontSizeChange}
        />
        <NumberInput
          style={{ width: 84 }}
          value={lineHeight}
          options={lineHeights}
          onChange={onLineHeightChange}
        />
        <AlignControl align={textAlign} onAlignChange={onTextAlignChange} />
        <ButtonGroup size="small">
          <Dropdown
            overlay={
              <Menu onSelect={this._handleOrderedListClick}>
                <Item key="number">1.</Item>
                <Item key="alphabet">a.</Item>
              </Menu>
            }
          >
            <Button>
              <img src={OrderedListIcon} />
              <Icon type="down" />
            </Button>
          </Dropdown>
          <Button onClick={this._handleUnorderedListClick}>
            <img src={UnorderedListIcon} />
          </Button>
        </ButtonGroup>
        <ColorPicker
          color={color}
          alpha={colorAlpha}
          onChange={onColorChange}
          placement="topLeft"
        >
          <Button ghost size="small">
            <ColorText size={20} color={color} alpha={colorAlpha} />
          </Button>
        </ColorPicker>
        <ColorPicker
          color={backgroundColor}
          alpha={backgroundColorAlpha}
          onChange={onBackgroundColorChange}
          placement="topLeft"
        >
          <Button ghost size="small">
            <ColorFill
              size={20}
              color={backgroundColor}
              alpha={backgroundColorAlpha}
              className="react-colorpicker-trigger"
            />
          </Button>
        </ColorPicker>
        {listIndent != null &&
          listDecoratorSize != null &&
          listPadding != null && (
            <Fragment>
              <InputNumber
                size="small"
                style={{ width: 48 }}
                value={listIndent}
                onChange={onListIndentChange}
              />
              <InputNumber
                size="small"
                style={{ width: 48 }}
                value={listDecoratorSize}
                onChange={onListDecoratorSizeChange}
              />
              <InputNumber
                size="small"
                style={{ width: 48 }}
                value={listPadding}
                onChange={onListPaddingChange}
              />
            </Fragment>
          )}
      </div>
    );
  }
}
