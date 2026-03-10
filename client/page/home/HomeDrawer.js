import React from 'react';
import { noop } from 'utils/FunctionUtils';
import { HomeSecondaryPageCategories } from 'common/constants';
import {
  HEDrawer,
  HEDrawerSection,
  HEDrawerSectionItem,
} from 'components/HEDrawer';
import HEButton from 'components/HEButton';
import CreateThemeTypeModal from '../components/CreateThemeTypeModal';
import { Tree } from 'antd';
import HEThemeActionBar from 'components/HEThemeActionBar';
import classNames from 'classnames';
import HEIcon from 'components/HEIcon';
import { validateRoleLimit } from 'common/utils';
const { TreeNode, DirectoryTree } = Tree;

export default class HomeDrawer extends React.Component {
  static defaultProps = {
    drawerData: [],
    types: {},
    selected: HomeSecondaryPageCategories.POPULAR,
    onSelect: noop,
  };
  state = {
    list: [],
    groupSelectId: null,
    defaultSelectedKeys: [],
    currentTempleteData: {},
  };

  _handleSelectNav(itemKey, type, userDeptId, groupId) {
    this.props.onSelect(itemKey, type, userDeptId, groupId);
  }
  _handleGoPopular() {
    const { history } = this.props;
    history.push('/home/popular');
  }

  async _handleConfirm(options = {}) {
    const success = await this.props.onConfirm(options);
    if (!success) return;
    this.setState({
      currentTempleteData: {},
    });
  }
  _handleConfirmShow() {
    const { onCreateThemeCategoriesToggle } = this.props;
    onCreateThemeCategoriesToggle(true);
  }

  _handleConfirmCancel() {
    const { onCreateThemeCategoriesToggle } = this.props;
    onCreateThemeCategoriesToggle(false);
    this.setState({
      currentTempleteData: {},
    });
  }

  render() {
    const {
      loading,
      drawerData,
      onCreateThemeOpen,
      onGroupInfoOpen,
      onCreateGroupOpen,
      onDeleteGroupOpen,
      onDeleteCategoryOpen,
      onCategoryInfoOpen,
      defaultThemeType,
      defaultThemeGroup,
      onCreateThemeCategoriesToggle,
      showModal,
    } = this.props;
    const { currentTempleteData } = this.state;
    if (loading) {
      return (
        <HEDrawer>
          <HEDrawerSection>
            <HEDrawerSectionItem loading={true} />
          </HEDrawerSection>
        </HEDrawer>
      );
    }
    const groupList = (parentIndex, group, userDeptId) => {
      return group.map((item) => {
        return (
          <TreeNode
            key={parentIndex + '-' + item._id}
            isLeaf
            icon={() => null}
            title={
              <HEThemeActionBar
                name={item.name}
                onSelect={() =>
                  this._handleSelectNav(
                    item.category,
                    'themeGroup',
                    userDeptId,
                    item._id
                  )
                }
                onDelete={() => onDeleteGroupOpen(item)}
                onRename={() => onGroupInfoOpen(item)}
                isGroup={true}
              ></HEThemeActionBar>
            }
          ></TreeNode>
        );
      });
    };
    const drawList = drawerData.map((item) => {
      const { groups, key, name, userDeptId } = item;
      return (
        <TreeNode
          icon={() => null}
          key={key}
          title={
            <HEThemeActionBar
              name={name}
              onAudit={() => {
                onCreateThemeCategoriesToggle(true);
                this.setState({
                  currentTempleteData: Object.assign({}, item, {
                    title: '更新模板类别',
                    isCreateTheme: false,
                    keyIds: key,
                  }),
                });
              }}
              onSelect={() =>
                this._handleSelectNav(key, 'theme', userDeptId, null)
              }
              onCreate={() => onCreateGroupOpen(item)}
              onDelete={() => onDeleteCategoryOpen(item)}
              onRename={() => onCategoryInfoOpen(item)}
              isGroup={false}
            ></HEThemeActionBar>
          }
        >
          {groups && groups.length > 0 && groupList(key, groups, userDeptId)}
        </TreeNode>
      );
    });
    let defaultSelectedKeys = [];
    let treeSelected;
    let popularSelected = false;
    if (defaultThemeType == 'popular') {
      popularSelected = true;
    } else {
      treeSelected = defaultThemeType;
      if (defaultThemeGroup) {
        treeSelected += '-' + defaultThemeGroup;
      }
      defaultSelectedKeys.push(treeSelected);
    }
    const TreeList = (
      <DirectoryTree
        blockNode={true}
        expandAction={false}
        className="he-drawer-section__container"
        onSelect={this._handleTreeSelect}
        defaultSelectedKeys={defaultSelectedKeys}
        defaultExpandedKeys={defaultSelectedKeys}
        selectedKeys={defaultSelectedKeys}
      >
        {drawList}
      </DirectoryTree>
    );

    return (
      <HEDrawer>
        <div className={'he-drawer-section__popular'}>
          <div
            className={classNames([
              'he-drawer-section__popular-item',
              { 'he-drawer-section__popular-item__selected': popularSelected },
            ])}
            onClick={() => this._handleSelectNav(null, 'popular', null, null)}
          >
            <HEIcon
              className={'he-drawer-section__popular-item__icon'}
              type="icon-hot"
            />
            <span>通用模板</span>
          </div>
          <div className="he-drawer-section__popular-item__top"></div>
          <div className="he-drawer-section__popular-item__scroll">
            {TreeList}
          </div>
          <div className="he-drawer-section__popular-item__bottom"></div>
          <div className="he-drawer-section__popular-bottom">
            {validateRoleLimit('addTheme') && (
              <div className="he-drawer-section__popular-bottom__btn">
                <HEButton onClick={onCreateThemeOpen} secondary={true}>
                  {'自定义模板'}
                </HEButton>
              </div>
            )}

            <div className="he-drawer-section__popular-bottom__btn">
              {validateRoleLimit('updateThemeGroup') && (
                <div className="he-drawer-section__popular-bottom__btn">
                  <HEButton
                    onClick={this._handleConfirmShow.bind(this)}
                    secondary={true}
                  >
                    {'新增模板类型'}
                  </HEButton>
                </div>
              )}
            </div>
          </div>
          {showModal && (
            <CreateThemeTypeModal
              {...currentTempleteData}
              onCancel={this._handleConfirmCancel.bind(this)}
              onConfirm={this._handleConfirm.bind(this)}
            ></CreateThemeTypeModal>
          )}
        </div>
      </HEDrawer>
    );
  }
}
