import 'globals';
import React, { useEffect, useRef, useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import './index.less';
import QueryString from 'common/queryString';
import ThemeCard from '../../../components/ThemeCard';
import useHomeStore from 'hook/useHomeStore';
import useScroll from 'hook/useScroll';
import noFile from 'components/imgs/nofile.png';

const List = () => {
  const store = useHomeStore();
  const listContainerRef = useRef();
  const [containerHeight, setContainerHeight] = useState(400);
  useEffect(() => {
    useScroll(listContainerRef.current, ({ direction, isBottomed }) => {
      if (direction == 'up' && isBottomed) {
        const { search } = QueryString.parse(location.search);
        store.getSearchThemeList({ search });
      }
    });
    setContainerHeight(document.body.clientHeight - 480);
  }, []);
  return useObserver(() => (
    <div className="index-search-list-wrapper">
      <div
        className="index-search-list-container"
        style={{ height: containerHeight }}
        ref={listContainerRef}
      >
        {store.search.list &&
          store.search.list.length > 0 &&
          store.search.list.map((item, index) => (
            <div key={index} className="index-search-list-item-wrapper">
              <ThemeCard
                id={item._id}
                key={index}
                themePoster={item.poster}
                auditStatus={item.auditStatus}
                name={item.name}
                loading={!item}
                collected={item.collected}
                hot={item.hot}
                onPreview={() => store.previewTheme({ themeInfo: item })}
                onCreateProject={() =>
                  store.createThemeProject({ theme: item })
                }
                onEdit={() => store.editThemeInfo(item._id, item.ruleId)}
                onCopy={() =>
                  store.copyThemeInfo(store.search.list, { themeId: item._id })
                }
                onRename={() => store.renameThemeInfo(item)}
                onDelete={() =>
                  store.deleteThemeInfo(store.search.list, {
                    themeId: item._id,
                  })
                }
                onExamine={() =>
                  store.examineThemeInfo(store.search.list, item)
                }
                onCollect={(action) =>
                  store.postCollect(store.search.list, action, item)
                }
                onRemove={() =>
                  store.removeTheme(store.search.list, {
                    themeId: item._id,
                    themeType: item.origin,
                    themeGroupId: item.themeGroupId,
                  })
                }
              ></ThemeCard>
            </div>
          ))}
        {store.search.list && store.search.list.length <= 0 && (
          <div className="index-list-nodata">
            <img className="index-list-nodata-img" src={noFile} />
            <div className="index-list-nodata-text">{'暂无任何内容哦'}</div>
          </div>
        )}
      </div>
    </div>
  ));
};
export default List;
