import './index.less';
import React from 'react';
import { Input } from 'antd';

const Search = Input.Search;

class SearchWidget extends React.Component {
  render() {
    return (
      <div className="he-editor-left-widget-panel__search-widget">
        <Search
          placeholder={'搜索组件名称'}
          className="he-editor-left-widget-panel__search-input"
          onSearch={this.props.onSearchWidget}
          onChange={this.props.onChangeSearch}
        />
      </div>
    );
  }
}
export default SearchWidget;
