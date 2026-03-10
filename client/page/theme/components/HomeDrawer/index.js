import React from 'react';
import { useObserver } from 'mobx-react-lite';
import './index.less';
import { HEDrawer } from 'components/HEDrawer';
import HEButton from 'components/HEButton';
import CreateThemeTypeModal from '../CreateThemeTypeModal';
import CreateThemeGroupModal from '../CreateThemeGroupModal';
import classNames from 'classnames';
import { validateRoleLimit } from 'common/utils';
import useHomeStore from 'hook/useHomeStore';
import TreeList from './TreeList';
import MycollectionIcon from 'static/imgs/mycollection.png';
import MycollectionSelectedIcon from 'static/imgs/mycollection-selected.png';
import RecommendIcon from 'static/imgs/recommend.png';
import RecommendSelectedIcon from 'static/imgs/recommend-selected.png';

const HomeDrawer = (props) => {
  const store = useHomeStore();
  return useObserver(() => (
    <HEDrawer>
      <div className={'he-drawer-section__popular'}>
        {(store.themeListMap['mycollection'] || []).length > 0 && (
          <div
            className={classNames([
              'he-drawer-section__popular-item',
              {
                'he-drawer-section__popular-item__selected':
                  store.selectDrawerNav == 'mycollection',
              },
            ])}
            onClick={() => {
              props.history.push('theme');
              store.handleSelectDrawerNav('mycollection');
              store.setThemeTypeAndThemeGroup({
                themeType: '',
                themeGroup: '',
              });
              setTimeout(() => {
                document.querySelector('.swiperlist-mycollection') &&
                  document
                    .querySelector('.swiperlist-mycollection')
                    .scrollIntoView();
              });
            }}
          >
            {store.selectDrawerNav != 'mycollection' && (
              <img
                className={'he-drawer-menu-icon'}
                src={MycollectionIcon}
              ></img>
            )}
            {store.selectDrawerNav == 'mycollection' && (
              <img
                className={'he-drawer-menu-icon'}
                src={MycollectionSelectedIcon}
              ></img>
            )}
            <span style={{ marginLeft: '8px' }}>我的收藏</span>
          </div>
        )}
        <div
          className={classNames([
            'he-drawer-section__popular-item',
            {
              'he-drawer-section__popular-item__selected':
                store.selectDrawerNav == 'recommend',
            },
          ])}
          onClick={() => {
            props.history.push('theme');
            store.handleSelectDrawerNav('recommend');
            store.setThemeTypeAndThemeGroup({ themeType: '', themeGroup: '' });
            setTimeout(() => {
              document.querySelector('.swiperlist-recommend') &&
                document
                  .querySelector('.swiperlist-recommend')
                  .scrollIntoView();
            });
          }}
        >
          {store.selectDrawerNav != 'recommend' && (
            <img className={'he-drawer-menu-icon'} src={RecommendIcon}></img>
          )}
          {store.selectDrawerNav == 'recommend' && (
            <img
              className={'he-drawer-menu-icon'}
              src={RecommendSelectedIcon}
            ></img>
          )}
          <span style={{ marginLeft: '8px' }}>优秀推荐</span>
        </div>
        <div className="he-drawer-section__popular-item__scroll">
          <TreeList history={props.history}></TreeList>
        </div>
        <div className="he-drawer-section__popular-item__bottom"></div>
        <div className="he-drawer-section__popular-bottom">
          {validateRoleLimit('addTheme') && (
            <div className="he-drawer-section__popular-bottom__btn">
              <HEButton
                onClick={() =>
                  store.createThemeInfo({ showCreateThemeType: true })
                }
                secondary={true}
              >
                {'自定义模板'}
              </HEButton>
            </div>
          )}
          <div className="he-drawer-section__popular-bottom__btn">
            {validateRoleLimit('updateThemeGroup') && (
              <div className="he-drawer-section__popular-bottom__btn">
                <HEButton onClick={store.createThemeType} secondary={true}>
                  {'新增模板类型'}
                </HEButton>
              </div>
            )}
          </div>
        </div>
        {store.createThemeTypeModal.show && (
          <CreateThemeTypeModal
            {...store.createThemeTypeModal.currentTempleteData}
            onCancel={store.createThemeTypeModal.onClose}
            onConfirm={store.createThemeTypeModal.onSubmit}
          ></CreateThemeTypeModal>
        )}
        {store.createThemeGroupModal.show && (
          <CreateThemeGroupModal
            onClose={store.createThemeGroupModal.onClose}
            onSubmit={(e, name) => store.createThemeGroupModal.onSubmit(name)}
          />
        )}
      </div>
    </HEDrawer>
  ));
};
export default HomeDrawer;
