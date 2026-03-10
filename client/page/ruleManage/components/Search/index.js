import React, { useEffect, useState } from 'react';
const { useObserver } = require('mobx-react-lite');
import { Input } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { baseControlsArray } from 'store/ruleComponentEdit/controls';
import './index.less';
import { getWidgetList } from 'apis/WidgetAPI';
import useRuleComponentEditStore from 'hook/useRuleComponentEditStore';
import { Tooltip } from 'antd';
const InputSearch = Input.Search;

const Search = () => {
  const store = useRuleComponentEditStore();
  const [search, setSearch] = useState('');
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const getList = async () => {
    if (!search) return;
    const { totalCount = 0, widgets = [] } = await getWidgetList({
      q: search,
      current: currentPage,
      pageSize: 10,
      type: 'rule',
      componentPlat: 'h5'
    });
    if (list.length < totalCount) {
      setList(list.concat(widgets));
      setCurrentPage(currentPage + 1);
    }
  };
  const handleSearch = (value) => {
    setSearch(value);
  };
  useEffect(() => {
    setList([]);
    setCurrentPage(1);
    search && getList();
  }, [search]);
  return useObserver(() =>
    <div className="rule-component-edit-search-wrapper">
      <InputSearch
        placeholder={'搜索组件名称'}
        onSearch={handleSearch}
      />
      <div className="rule-component-edit-search-list-wrapper" id="scrollableContainer">
        {!search && <ul className="rule-component-edit-search-list">
          {baseControlsArray.map(item =>
            <li key={item.type}
              className="rule-component-edit-search-list-item"
              onClick={() => store.selectControl(item.type)}
            >
              <Tooltip placement='topLeft' title={() => (
                <a style={{ color: '#fff', textDecoration: 'underline' }}
                  onClick={() => god.open(god.location.protocol + '//' + god.location.hostname + `/docs/control/${item.type == 'CheckBox' ? 'Checkbox' : item.type}.html`)}
                >说明文档</a>
              )} arrowPointAtCenter>
                {item.type} ({item.name})
              </Tooltip>
            </li>
          )}
        </ul>}
        {search && <InfiniteScroll
          className="rule-component-edit-search-list"
          dataLength={list.length}
          next={getList}
          hasMore={true}
          scrollableTarget="scrollableContainer"
        >
          {list.length > 0 && list.map(item =>
            <div key={item._id}
              className="rule-component-edit-search-list-item"
              onClick={() => store.selectRuleComponent({ type: item.type, version: item.version })}
            >
              {item.widgetUrl && <Tooltip placement='topLeft' title={() => (
                <a style={{ color: '#fff', textDecoration: 'underline' }}
                  onClick={() => god.open(item.widgetUrl)}
                >示例图</a>
              )} arrowPointAtCenter>
                {item.type} ({item.name})
              </Tooltip>}
              {!item.widgetUrl && <div>{item.type} ({item.name})</div>}
            </div>
          )}
        </InfiniteScroll>}
      </div>
    </div>
  );
};
export default Search;