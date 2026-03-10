import 'globals';
import React, { useEffect } from 'react';
import { useObserver } from 'mobx-react-lite';
import { Row } from 'antd';
import './index.less';
import QueryString from 'common/queryString';
import useHomeStore from 'hook/useHomeStore';
import { validateRoleLimit } from 'common/utils';

import Banner from './components/Banner';
import SwiperList from './components/SwiperList';
import List from './components/List';
import HESearchInput from 'components/HESearchInput';
import HomeDrawer from '../components/HomeDrawer';

const Popular = (props) => {
  const store = useHomeStore();
  const appendSearch = (params) => {
    props.history.push(
      location.pathname + QueryString.appendQuery(location.search, params)
    );
  };
  useEffect(() => {
    store.getCategoryList();
    store.getRuleData();
  }, []);
  useEffect(() => {
    const search = async () => {
      const { search } = QueryString.parse(location.search);
      if (search) {
        await store.getSearchThemeList({ search });
      }
    };
    search();
  }, [location.search]);

  return useObserver(() => (
    <div className="popular-wrapper">
      <div className="popular-left-wrapper">
        <HomeDrawer history={props.history} />
      </div>
      <div className="popular-right-wrapper">
        <div className="popular-right-container">
          <Banner></Banner>
          <Row
            type="flex"
            justify="space-between"
            align="middle"
            style={{ width: '100%', marginTop: '25px' }}
          >
            <HESearchInput
              className="index-search-input"
              placeholder={'搜索模板名或模板号'}
              defaultValue={QueryString.parse(location.search).search || ''}
              onSearch={(e) => {
                e.target.value.trim() !=
                  (QueryString.parse(location.search).search || '') &&
                  store.resetSearchThemeList();
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
                    store.createProject({ theme: {} });
                  }}
                >
                  <i>+</i> 创建空白项目
                </div>
              </div>
            )}
          </Row>
          {!QueryString.parse(location.search).search && (
            <>
              <SwiperList
                key="mycollection"
                data={{ name: '我的收藏', key: 'mycollection' }}
                history={props.history}
              ></SwiperList>
              <SwiperList
                key="recommend"
                data={{ name: '优秀推荐', key: 'recommend' }}
              ></SwiperList>
              {store.drawerData.length > 0 &&
                store.drawerData.map((item) => (
                  <SwiperList
                    key={item.key}
                    data={item}
                    history={props.history}
                  ></SwiperList>
                ))}
            </>
          )}
          {QueryString.parse(location.search).search && <List></List>}
        </div>
      </div>
    </div>
  ));
};
export default Popular;
