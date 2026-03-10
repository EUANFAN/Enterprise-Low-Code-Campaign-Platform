import React, { Fragment } from 'react';
import {
  DEFAULT_LIST_DECORATOR_SIZE,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_LIST_PADDING,
} from './constants';
import { RichTextClasses } from '../../constants';
import { Map } from 'immutable';
import numberToLetter from 'number-to-letter';

export const AlphabetListItem = (props) => {
  return (
    <BaseListItem
      className={RichTextClasses.LIST_ITEM__ALPHABET}
      {...props}
      renderDecorator={(index) => `${numberToLetter(index).toLowerCase()}.`}
    />
  );
};

export const NumberListItem = (props) => {
  return (
    <BaseListItem
      className={RichTextClasses.LIST_ITEM__NUMBER}
      {...props}
      renderDecorator={(index) => `${index + 1}.`}
    />
  );
};

const BaseListItem = (props) => {
  const {
    index: itemIndex,
    children,
    renderDecorator,
    node,
    attributes,
    decoratorSize,
    padding: listPadding,
    className,
  } = props;
  const inlineStyle = node
    .getMarks()
    .reduce((prev, curr) => prev.merge(curr.data), Map());
  const blockStyle = node
    .getBlocks()
    .reduce((prev, curr) => prev.merge(curr.data), Map());
  const firstText = node.getFirstText();
  const firstTextStyle = firstText
    ? firstText.getMarksAtIndex(0).reduce((prev, curr) => {
        return prev.mergeDeep(curr.data);
      }, Map())
    : Map();
  const fontFamily = firstTextStyle.get('fontFamily') || DEFAULT_FONT_FAMILY;
  const fontWeight = firstTextStyle.get('fontWeight') || DEFAULT_FONT_WEIGHT;

  return (
    <div {...attributes} className={className}>
      {React.Children.map(children, (child, index) => {
        if (index === 0) {
          return (
            <div style={{ position: 'relative' }}>
              <span
                contentEditable={false}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  fontSize: inlineStyle.get('fontSize') || DEFAULT_FONT_SIZE,
                  lineHeight: blockStyle.get('lineHeight'),
                  position: 'absolute',
                  right: '100%',
                }}
              >
                <span
                  style={{
                    textAlign: 'left',
                    fontSize:
                      decoratorSize != null
                        ? decoratorSize
                        : firstTextStyle.get('fontSize') ||
                          DEFAULT_LIST_DECORATOR_SIZE,
                    userSelect: 'none',
                    color: firstTextStyle.get('color'),
                    fontFamily: `${fontFamily}-${fontWeight}`,
                    transform: `translateX(-${
                      listPadding || DEFAULT_LIST_PADDING
                    }px)`,
                    WebkitUserSelect: 'none',
                    verticalAlign: 'baseline',
                    display: 'inline-block',
                  }}
                >
                  {renderDecorator && renderDecorator(itemIndex)}
                </span>
              </span>
              {child}
            </div>
          );
        }
        return child;
      })}
    </div>
  );
};

export const CircleListItem = (props) => {
  return (
    <BaseListItem
      {...props}
      className={RichTextClasses.LIST_ITEM__CIRCLE}
      renderDecorator={() => (
        <Fragment>
          &nbsp;
          <div
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '0.33em',
              height: '0.33em',
              background: 'currentColor',
              borderRadius: '50%',
            }}
          />
        </Fragment>
      )}
    />
  );
};
