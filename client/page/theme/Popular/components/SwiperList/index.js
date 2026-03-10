import React, { useEffect, useRef } from 'react';
import { useObserver } from 'mobx-react-lite';
import classNames from 'classnames';
import useHomeStore from 'hook/useHomeStore';
import HETag from 'components/HETag';
import ThemeCard from '../../../components/ThemeCard';
import './index.less';
import noFile from 'components/imgs/nofile.png';

const SwiperList = (props) => {
  const store = useHomeStore();
  const wrapperRef = useRef();
  const listContainerRef = useRef();
  const formatThemeGroupId = () => {
    return props.data.groups.map((item) => item._id).join(',');
  };
  const handleTagChange = async (val) => {
    const list = await store.getThemeList({
      themeGroupId: val.name == '全部' ? formatThemeGroupId() : val._id,
    });
    store.setThemeListMap(props.data.key, list);
    store.setThemeTypeAndThemeGroup({
      themeType: props.data.key,
      themeGroup: val._id,
    });
  };
  useEffect(() => {
    var intersectionObserver = new IntersectionObserver(async function (
      entries
    ) {
      if (entries[0].intersectionRatio <= 0) return;
      // 出现在可视区域
      if (!store.themeListMap.hasOwnProperty(props.data.key)) {
        let params = {};
        if (props.data.key == 'mycollection') {
          // 我的收藏
          params.themeGroupId = 'mycollection';
        } else if (props.data.key == 'recommend') {
          // 优秀推荐
          params.themeGroupId = 'recommend';
          if (store.config.recommendList.length <= 0) {
            await store.getRuleData();
          }
          if (store.config.recommendList.length > 0) {
            params.search = store.config.recommendList
              .slice(0, 10)
              .map((i) => i.id)
              .join(',');
          }
        } else {
          params = { themeGroupId: formatThemeGroupId() };
        }
        if (params.themeGroupId) {
          const list = await store.getThemeList(params);
          store.setThemeListMap(props.data.key, list);
        }
      }
    });
    wrapperRef.current && intersectionObserver.observe(wrapperRef.current);
  }, []);
  return useObserver(() => (
    <div
      className={classNames([
        'swiper-list-wrapper',
        'swiperlist-' + props.data.key,
      ])}
      ref={wrapperRef}
    >
      {!(
        props.data.key == 'mycollection' &&
        (store.themeListMap[props.data.key] || []).length <= 0
      ) && (
        <>
          <div className="swiper-list-title">{props.data.name}</div>
          {(props.data.groups || []).length > 0 && (
            <HETag
              defaultValue={props.data.groups.find(
                (i) => i._id == store.themeGroup
              )}
              list={props.data.groups || []}
              onChange={handleTagChange}
            ></HETag>
          )}
          <div className="swiper-list-container">
            <div
              className={classNames([
                'swiper-list-content',
                'swiper-list-content-' + props.data.key,
              ])}
              ref={listContainerRef}
            >
              {(store.themeListMap[props.data.key] || []).length > 0 &&
                store.themeListMap[props.data.key]
                  .slice(0, props.data.key == 'recommend' ? 10 : 5)
                  .map((item, index) => (
                    <div key={index} className="swiper-list-item-wrapper">
                      <ThemeCard
                        id={item._id}
                        key={index}
                        themePoster={item.poster}
                        auditStatus={item.auditStatus}
                        name={item.name}
                        loading={!item}
                        collected={item.collected}
                        hot={item.hot}
                        type={props.data.key}
                        onPreview={() =>
                          store.previewTheme({ themeInfo: item })
                        }
                        onCreateProject={() =>
                          store.createThemeProject({ theme: item })
                        }
                        onEdit={() =>
                          store.editThemeInfo(item._id, item.ruleId)
                        }
                        onCopy={() =>
                          store.copyThemeInfo(
                            store.themeListMap[props.data.key],
                            { themeId: item._id }
                          )
                        }
                        onRename={() =>
                          store.renameThemeInfo(
                            store.themeListMap[props.data.key],
                            item
                          )
                        }
                        onDelete={() =>
                          store.deleteThemeInfo(
                            store.themeListMap[props.data.key],
                            { themeId: item._id }
                          )
                        }
                        onExamine={() =>
                          store.examineThemeInfo(
                            store.themeListMap[props.data.key],
                            item
                          )
                        }
                        onCollect={(action) =>
                          store.postCollect(
                            store.themeListMap[props.data.key],
                            action,
                            item
                          )
                        }
                        onRemove={() =>
                          store.removeTheme(
                            store.themeListMap[props.data.key],
                            {
                              themeId: item._id,
                              themeType: item.origin,
                              themeGroupId: item.themeGroupId,
                            }
                          )
                        }
                      ></ThemeCard>
                    </div>
                  ))}
              {props.data.key != 'recommend' &&
                (store.themeListMap[props.data.key] || []).length > 5 && (
                  <div
                    className="swiper-list-item-more"
                    onClick={() => {
                      store.setThemeTypeAndThemeGroup({
                        themeType: props.data.key,
                        themeGroup:
                          props.data.key == store.themeType
                            ? store.themeGroup
                            : '',
                      });
                      props.history.push(
                        '/theme/list/' +
                          props.data.key +
                          '?tag=' +
                          store.themeGroup
                      );
                    }}
                  >
                    <i className="swiper-list-item-more-icon"></i>
                    <span className="swiper-list-item-more-text">查看更多</span>
                  </div>
                )}
              {(store.themeListMap[props.data.key] || []).length <= 0 && (
                <div className="index-list-nodata">
                  <img className="index-list-nodata-img" src={noFile} />
                  <div className="index-list-nodata-text">
                    {'暂无任何内容哦'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  ));
};

export default SwiperList;
