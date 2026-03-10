import 'globals';
import React, { useEffect, useRef, useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import { Row, Icon } from 'antd';
import './index.less';
import useHomeStore from 'hook/useHomeStore';
import useScroll from 'hook/useScroll';
import QueryString from 'common/queryString';
import { validateRoleLimit } from 'common/utils';

import HEButton from 'components/HEButton';
import HESelect from 'components/HESelect';
import HESearchInput from 'components/HESearchInput';
import HETag from 'components/HETag';
import ThemeCard from '../components/ThemeCard';
import noFile from 'components/imgs/nofile.png';
const auditStatusOptions = [
  {
    key: '模版状态',
    value: '0,1,2,3',
  },
  {
    key: '待审核',
    value: '0,3',
  },
  {
    key: '审核中',
    value: '1',
  },
  {
    key: '已公开',
    value: '2',
  },
];
const List = (props) => {
  const themeType = props.match.params.themeType;
  const store = useHomeStore();
  const listContainerRef = useRef();
  const [isFixed, setIsFixed] = useState(false);
  const appendSearch = (params) => {
    props.history.push(
      location.pathname + QueryString.appendQuery(location.search, params)
    );
  };
  const formatThemeGroupId = () => {
    return (store.listData.themeTypeData.groups || [])
      .map((item) => item._id)
      .join(',');
  };
  const formatQuery = () => {
    const { tag, search, auditStatus } = QueryString.parse(location.search);
    return {
      themeGroupId: tag && tag != 'all' ? tag : formatThemeGroupId(),
      search,
      auditStatus,
    };
  };
  const handleTagChange = (val) => {
    if (val._id == 'all') {
      store.setListDataSearchParams({
        ...formatQuery(),
        themeGroupId: formatThemeGroupId(),
        currentPage: 1,
      });
      appendSearch({ tag: '' });
    } else {
      store.setListDataSearchParams({
        ...formatQuery(),
        themeGroupId: val._id,
        currentPage: 1,
      });
      appendSearch({ tag: val._id });
    }
  };
  useEffect(() => {
    const init = async () => {
      if (themeType == 'mycollection') {
        // 我的收藏
        store.setListDataSearchParams({
          ...formatQuery(),
          themeGroupId: 'mycollection',
        });
      } else {
        await store.setThemeTypeData(themeType);
        store.setListDataSearchParams(formatQuery());
      }
      const minRowNum = Math.ceil((document.body.clientHeight - 375) / 300);
      store.getListData({ minRowNum });
      useScroll(
        listContainerRef.current,
        ({ direction, isBottomed, scrollTop }) => {
          const limitOffsetTop = document.querySelector(
            '.index-list-divider'
          ).offsetTop;
          setIsFixed(scrollTop >= limitOffsetTop);
          if (direction == 'up' && isBottomed) {
            store.getListData({});
          }
        },
        50
      );
    };
    init();
  }, [location.search]);
  return useObserver(() => {
    return (
      <div className="index-list-wrapper" ref={listContainerRef}>
        <div className="index-list-header-body">
          <div
            className="index-list-back-wrapper"
            onClick={() => {
              store.resetThemeTypeData();
              props.history.push('/theme');
            }}
          >
            <Icon type="left"></Icon>返回分类
          </div>
          <Row
            type="flex"
            justify="space-between"
            align="middle"
            style={{ width: '100%', marginTop: '25px', marginBottom: '25px' }}
          >
            <HESearchInput
              className="index-search-input"
              placeholder={'搜索模板名或模板号'}
              defaultValue={QueryString.parse(location.search).search || ''}
              onSearch={(e) => {
                appendSearch({ search: e.target.value.trim() });
              }}
            ></HESearchInput>
            {validateRoleLimit('addProject') && (
              <div className="index-search-input-right-wrapper">
                <p className="index-search-input-right-tip">
                  没有合适的模版？可以试试创建空白模版哦～
                </p>
                <div
                  className="index-create-project-btn"
                  onClick={() => {
                    store.createProject();
                  }}
                >
                  <i>+</i> 创建空白项目
                </div>
              </div>
            )}
          </Row>
          <div className="index-list-divider"></div>
        </div>
        {isFixed && <div className="index-list-fixed-emtpy-wrapper"></div>}
        <div
          className={
            isFixed ? 'index-list-fixed-wrapper' : 'index-list-fix-wrapper'
          }
        >
          <Row
            type="flex"
            justify="space-between"
            align="middle"
            style={{ width: '1160px', margin: '25px auto 15px' }}
          >
            <div className="index-list-title">
              {themeType == 'mycollection'
                ? '我的收藏'
                : store.listData.themeTypeData.name}
            </div>
            {validateRoleLimit('addTheme') && (
              <Row type="flex">
                <HESelect
                  value={
                    QueryString.parse(location.search).auditStatus || '0,1,2,3'
                  }
                  onSelect={(e, val) => appendSearch({ auditStatus: val })}
                  className="theme-search-status"
                  options={auditStatusOptions}
                ></HESelect>
                <HEButton
                  onClick={() =>
                    store.createThemeInfo({
                      themeType: themeType == 'mycollection' ? '' : themeType,
                      themeGroupId:
                        QueryString.parse(location.search).tag || '',
                    })
                  }
                >
                  {'新建模板'}
                </HEButton>
              </Row>
            )}
          </Row>
          {(store.listData.themeTypeData.groups || []).length > 0 && (
            <Row style={{ width: '1160px', margin: '0 auto' }}>
              <HETag
                list={store.listData.themeTypeData.groups || []}
                defaultValue={(store.listData.themeTypeData.groups || []).find(
                  (i) => i._id == QueryString.parse(location.search).tag
                )}
                onChange={handleTagChange}
              ></HETag>
            </Row>
          )}
        </div>
        <div className="index-list-container">
          <div className="index-list-body">
            {store.listData.sectionArray.length > 0 &&
              store.listData.sectionArray.map((section) => (
                <div className="index-list-section-wrapper" key={section._id}>
                  <div className="index-list-section-title">
                    {
                      (
                        (store.listData.themeTypeData.groups || []).find(
                          (i) => i._id == section._id
                        ) || []
                      ).name
                    }
                  </div>
                  <div className="index-list-section-list-wrapper">
                    {section.list.length > 0 &&
                      section.list.map((item) => (
                        <div className="index-list-item-wrapper" key={item._id}>
                          <ThemeCard
                            id={item._id}
                            key={item._id}
                            themePoster={item.poster}
                            auditStatus={item.auditStatus}
                            name={item.name}
                            loading={!item}
                            collected={item.collected}
                            hot={item.hot}
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
                              store.copyThemeInfo(section.list, {
                                themeId: item._id,
                              })
                            }
                            onRename={() =>
                              store.renameThemeInfo(section.list, item)
                            }
                            onDelete={() =>
                              store.deleteThemeInfo(section.list, {
                                themeId: item._id,
                              })
                            }
                            onExamine={() =>
                              store.examineThemeInfo(section.list, item)
                            }
                            onCollect={(action) =>
                              store.postCollect(section.list, action, item)
                            }
                            onRemove={() =>
                              store.removeTheme(section.list, {
                                themeId: item._id,
                                themeType: item.origin,
                                themeGroupId: item.themeGroupId,
                              })
                            }
                          ></ThemeCard>
                        </div>
                      ))}
                  </div>
                  {section.list.length <= 0 && (
                    <div className="index-list-nodata">
                      <img className="index-list-nodata-img" src={noFile} />
                      <div className="index-list-nodata-text">
                        {'暂无任何内容哦'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  });
};
export default List;
