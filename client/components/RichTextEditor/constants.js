import { Value } from 'slate';
import { List } from 'immutable';

export const INITIAL_STATE = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [{ object: 'text', leaves: [{ text: '' }] }],
      },
    ],
  },
  decorations: List(),
});

export const DEFAULT_TEXT_ALIGN = 'left';
export const DEFAULT_FONT_FAMILY = 'PingFangSC';
export const DEFAULT_FONT_WEIGHT = 'Regular';
export const DEFAULT_LINE_HEIGHT = 1.2;
export const DEFAULT_FONT_SIZE = 12;
export const DEFAULT_COLOR = '#000';
export const DEFAULT_COLOR_ALPHA = 100;
export const DEFAULT_BACKGROUND_COLOR = '#fff';
export const DEFAULT_BACKGROUND_COLOR_ALPHA = 0;

export const DEFAULT_LIST_DECORATOR_SIZE = 12;
export const DEFAULT_LIST_INDENT = 40;
export const DEFAULT_LIST_PADDING = 4;

export const RichTextClasses = {
  PARAGRAPH: 'h5-rich-text-paragraph',
  MARK__FONT_FAMILY: 'h5-rich-text-mark--font-family',
  MARK__FONT_WEIGHT: 'h5-rich-text-mark--font-weight',
  MARK__FONT_SIZE: 'h5-rich-text-mark--font-size',
  MARK__TEXT_COLOR: 'h5-rich-text-mark--text-color',
  MARK__BACKGROUND_COLOR: 'h5-rich-text-mark--background-color',
  LIST: 'h5-rich-text-list',
  LIST_ITEM__NUMBER: 'h5-rich-text-list-item--number',
  LIST_ITEM__CIRCLE: 'h5-rich-text-list-item--circle',
  LIST_ITEM__ALPHABET: 'h5-rich-text-list-item--alphabet',
};

export const Marks = {
  FONT_FAMILY: 'font-family',
  FONT_WEIGHT: 'font-weight',
  FONT_SIZE: 'font-size',
  TEXT_COLOR: 'text-color',
  BACKGROUND_COLOR: 'background-color',
};

export const ListTypes = {
  ORDERED_LIST: 'ol_list',
  UNORDERED_LIST: 'ul_list',
  LIST_ITEM: 'list_item',
};
