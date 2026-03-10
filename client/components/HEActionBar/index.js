import React from 'react';
import HESearchInput from 'components/HESearchInput';
import HEIcon from 'components/HEIcon';
import HEButton from 'components/HEButton';
import HEDropDwonMenu from 'components/HEDropDwonMenu';
import BulkOperationButton from 'components/BulkOperationButton';
import { HEMenu, HEMenuItem } from 'components/HEMenu';
import QueryString from 'common/queryString';
import HETooltip from 'components/HETooltip';
import Trashcan from 'components/icons/Trashcan';
import Restore from 'components/icons/Restore';
import AllChoose from 'components/icons/AllChoose';
import CurrentChoose from 'components/icons/CurrentChoose';
import Edit from 'components/icons/Edit';
import Move from 'components/icons/Move';
import Export from 'components/icons/Export';
import UpGrade from 'components/icons/UpGrade';
import Translate from 'components/icons/Translate';
import './index.less';
import { validateRoleLimit } from 'common/utils';
import { observer } from 'mobx-react';
@observer
class HEActionBar extends React.Component {
  state = {
    showCreate: false,
  };

  _handleMenuOpen = (params) => {
    this._handleMenuClose();
    this.setState({
      [params]: !this.state[params],
    });
  };
  _handleMenuClose = () => {
    this.setState({
      showCreate: false,
    });
  };

  _handleCreateProject = () => {
    this.setState({
      showCreate: false,
    });
    this.props._handleCreateProject();
  };

  _handleCreateFolder = () => {
    this.setState({
      showCreate: false,
    });
    this.props._handleCreateFolder();
  };

  render() {
    const { showCreate } = this.state;
    const {
      match: {
        params: { roleId },
      },
      isBulkMode,
      chooseAllFlag,
      chooseCurrentFlag,
      _handleChooseAll,
      _handleChooseCurrentPage,
      _handleToggleBulkMode,
      _handleBulkOrOneDelete,
      _handleBulkOrOneRestore,
      _handleBulkMoveClick,
      _handleBulkTransfer,
      _handleUpGrade,
      _handleBulkPublish,
      _handleChangeConfig,
      _handleSearch,
      location,
      onShowType,
      showTypeCard,
    } = this.props;
    const { search } = QueryString.parse(location.search);
    let chooseAllText = this.state.chooseAllFlag ? '取消全选' : '全选';
    let chooseCurrentText = this.state.chooseCurrentFlag
      ? '取消选中当前页'
      : '选中当前页';

    return (
      <div className="he-action-bar">
        <div className="he-action-bar_left">
          {!/^(all|join)$/g.test(roleId) && validateRoleLimit('addProject') && (
            <HEDropDwonMenu
              className="he-action-bar_left__create"
              active={showCreate}
              icon="icon-iconjia"
              title="新建"
              onClick={this._handleMenuOpen.bind(this, 'showCreate')}
              onClose={this._handleMenuClose}
              width={132}
              menuTop={34}
            >
              <HEMenu>
                <HEMenuItem onClick={this._handleCreateProject.bind(this)}>
                  <HEIcon className="he-action-bar__project" type="icon-file" />
                  {'新建项目'}
                </HEMenuItem>
                <HEMenuItem onClick={this._handleCreateFolder.bind(this)}>
                  <HEIcon
                    className="he-action-bar__folder"
                    type="icon-folder"
                  />
                  {'新建文件夹'}
                </HEMenuItem>
              </HEMenu>
            </HEDropDwonMenu>
          )}
          {!/^(join)$/g.test(roleId) && (
            <BulkOperationButton
              className="h5-resources-images__actions__action"
              outline={true}
              active={isBulkMode}
              onToggle={_handleToggleBulkMode}
            >
              {
                <HETooltip text={chooseCurrentText}>
                  <CurrentChoose
                    isSelected={chooseCurrentFlag}
                    onClick={_handleChooseCurrentPage.bind(this)}
                  ></CurrentChoose>
                </HETooltip>
              }
              {
                <HETooltip text={chooseAllText}>
                  <AllChoose
                    isSelected={chooseAllFlag}
                    onClick={_handleChooseAll.bind(this)}
                  ></AllChoose>
                </HETooltip>
              }

              {location.pathname == '/projects/bin' ? (
                <HETooltip text={'还原'}>
                  <Restore
                    onClick={(event) => _handleBulkOrOneRestore(event, null)}
                    className="h5-resources-images__actions__action__secondary-action"
                  />
                </HETooltip>
              ) : (
                <HETooltip text={'删除'}>
                  <Trashcan
                    onClick={(event) => _handleBulkOrOneDelete(event, null)}
                    className="h5-resources-images__actions__action__secondary-action"
                  />
                </HETooltip>
              )}
              <HETooltip text={'移动到组'}>
                <Move
                  onClick={_handleBulkMoveClick}
                  className="h5-resources-images__actions__action__secondary-action"
                />
              </HETooltip>

              <HETooltip text={'转移项目'}>
                <Export
                  onClick={_handleBulkTransfer}
                  className="h5-resources-images__actions__action__secondary-action"
                />
              </HETooltip>
              <HETooltip text={'发布'}>
                <Translate
                  onClick={_handleBulkPublish}
                  className="h5-resources-images__actions__action__secondary-action"
                />
              </HETooltip>
              {
                <React.Fragment>
                  <HETooltip text={'升级'}>
                    <UpGrade
                      onClick={_handleUpGrade}
                      className="h5-resources-images__actions__action__secondary-action"
                    />
                  </HETooltip>
                  <HETooltip text={'修改配置'}>
                    <Edit
                      onClick={_handleChangeConfig}
                      className="h5-resources-images__actions__action__secondary-action"
                    />
                  </HETooltip>
                </React.Fragment>
              }
            </BulkOperationButton>
          )}
        </div>
        <div className="he-action-bar_right">
          <HESearchInput
            placeholder={'网页标题、项目名或项目号'}
            key={search}
            defaultValue={search}
            onSearch={_handleSearch}
          ></HESearchInput>
          {/* TODO：暂时关闭列表&卡片切换入口 */}
          {false && <HEButton
            className="he-action-bar_right-list"
            icon={showTypeCard ? 'icon-liebiao' : 'icon-kapian'}
            outline={true}
            onClick={onShowType}
          >
            {showTypeCard ? '列表' : '卡片'}
          </HEButton>}
        </div>
      </div>
    );
  }
}
export default HEActionBar;
