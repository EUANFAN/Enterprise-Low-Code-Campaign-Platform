import React from 'react';
import { TAG_TITLE } from 'common/constants';
import './index.less';
import { Tag } from 'antd';
import classNames from 'classnames';

const { CheckableTag } = Tag;
export default class HETagPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedType: this.props.selectedType || 'all',
      selectedTags: [],
      selectedAll: true
    };
  }
  handleChange(tag) {
    const nextSelectedTags = [tag];
    this.setState({
      selectedAll: false,
      selectedTags: nextSelectedTags
    });
    this.props.getWidgetByTag(nextSelectedTags, this.state.selectedType);
  }
  handleChangeType(key) {
    this.setState(
      {
        selectedType: key,
        selectedTags: [],
        selectedAll: true
      },
      () => {
        this.props.getWidgetByTagType(key === 'all' ? null : key);
      }
    );
  }
  handleSelectAll() {
    this.setState({
      selectedAll: !this.state.selectedAll,
      selectedTags: []
    });
    this.props.getWidgetByTag([], this.state.selectedType);
  }
  onSelectAll() {
    this.setState({
      selectedAll: true,
      selectedTags: []
    });
  }
  render() {
    const {
      className: classNameFromProps,
      tagList,
      title,
      showTagTitle
    } = this.props;
    const { selectedTags, selectedType, selectedAll } = this.state;
    const className = classNames(['he-tag-panel', classNameFromProps]);

    return (
      <div className={className}>
        {showTagTitle &&
          (title ? (
            <p className="he-tag-panel__title">{title}:</p>
          ) : (
            <div className="he-tag-panel__title-group">
              {Object.keys(TAG_TITLE).map((key) => (
                <CheckableTag
                  key={key}
                  className="he-tag-panel__tag"
                  checked={selectedType == key}
                  onChange={(checked) => this.handleChangeType(key, checked)}
                >
                  {TAG_TITLE[key]}
                </CheckableTag>
              ))}
            </div>
          ))}
        {tagList[selectedType] && tagList[selectedType].length ? (
          <div className="he-tag-panel__title-group">
            <React.Fragment>
              <CheckableTag
                key="all"
                className="he-tag-panel__tag"
                checked={selectedAll}
                onChange={(checked) => this.handleSelectAll(checked)}
              >
                {'全部'}
              </CheckableTag>
              {tagList[selectedType].map((tag) => (
                <CheckableTag
                  key={tag._id}
                  className="he-tag-panel__tag"
                  checked={selectedTags.indexOf(tag._id) > -1}
                  onChange={(checked) => this.handleChange(tag._id, checked)}
                >
                  {tag.name}
                </CheckableTag>
              ))}
            </React.Fragment>
          </div>
        ) : null}
      </div>
    );
  }
}
