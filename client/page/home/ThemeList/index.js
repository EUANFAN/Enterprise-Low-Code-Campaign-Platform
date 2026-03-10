import React from 'react';
import HELoading from 'components/HELoading';
import HELoadingFalse from 'components/HELoading/loadingFalse';
import ThemeCard from './../ThemeCard';
import './index.less';
import noFile from 'components/imgs/nofile.png';
import QueryString from 'common/queryString';
import HESearchInput from 'components/HESearchInput';
import HEInputSelect from 'components/HEInputSelect';
import HEPagination from 'components/HEPagination';
import HEThemePreview from 'components/HEThemePreview';
import HEButton from 'components/HEButton';
import HEBreadcrumb from 'components/HEBreadcrumb';
import { withRouter } from 'react-router';
import { validateRoleLimit } from 'common/utils';
const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  pagination: { marginTop: 16 },
  table: { width: '100%' },
};
@withRouter
class ThemeList extends React.Component {
  static defaultProps = {
    list: null,
    listToRender: null,
  };
  state = {
    previewTarget: null,
  };

  _handlePreview = (event, index) => {
    const { listToRender } = this.props;
    const themeInfo = listToRender[index];
    this.setState({ previewTarget: themeInfo._id, themeInfo });
  };

  _handlePreviewClose = () => {
    this.setState({ previewTarget: null });
  };
  _handleSelect = (value) => {
    const keyword = value.trim();
    const { history, location } = this.props;
    const params = QueryString.stringify(
      Object.assign(QueryString.parse(location.search), {
        auditStatus: keyword,
      })
    );
    history.push(`${location.pathname}?${params}`);
  };
  render() {
    const {
      total,
      current,
      loading,
      onCreateProject,
      onCreateTheme,
      onCopy,
      onRename,
      onDelete,
      onOpen,
      onEdit,
      listToRender,
      error,
      onSearch,
      isPopular,
      goToPage,
      isTheme,
      breadcrumbList,
      onBreadcrumbClick,
      onExamine,
    } = this.props;
    const { previewTarget, themeInfo } = this.state;
    if (error) {
      return <HELoadingFalse />;
    }
    const { search, userDeptId, auditStatus } = QueryString.parse(
      location.search
    );
    const _renderInputSeach = () => {
      if (!isPopular && isTheme) {
        let auditStatusOptions = [
          {
            text: '全部',
            value: '0,1,2,3',
          },
          {
            text: '仅自己可见',
            value: '0,1,3',
          },
          {
            text: '所有人可见',
            value: '2',
          },
        ];
        return (
          <HEInputSelect
            className="he-input-select"
            key={search}
            defaultSearchValue={search}
            defaultSelectValue={auditStatus}
            onSearch={onSearch}
            onSelect={this._handleSelect}
            options={auditStatusOptions}
            placeholder={'模板名或模板号'}
          />
        );
      }
      return (
        <HESearchInput
          placeholder={'模板名或模板号'}
          key={search}
          defaultValue={search}
          onSearch={onSearch}
        ></HESearchInput>
      );
    };
    return (
      <div className="theme-list-page">
        {!isPopular && (
          <>
            <div className="theme-list-page__head">
              <div className="theme-list-page__head__create">
                {!isPopular && isTheme && validateRoleLimit('addTheme') && (
                  <HEButton onClick={onCreateTheme}>{'新建模板'}</HEButton>
                )}
              </div>
              <div className="theme-list-page__head__search">
                <div className="theme-list-page__head__search_container">
                  {_renderInputSeach()}
                </div>
              </div>
            </div>

            <div className="theme-list-page__head-title">
              {!isPopular && isTheme && (
                <HEBreadcrumb
                  sign=">"
                  list={breadcrumbList}
                  onClick={onBreadcrumbClick}
                />
              )}
            </div>
          </>
        )}
        {loading ? (
          <HELoading />
        ) : (
          <div
            className="theme-list-page__main"
            style={listToRender.length === 0 ? { display: 'flex' } : null}
          >
            {listToRender.length === 0 ? (
              <div className="theme-list-page__main__nodata">
                <img
                  className="theme-list-page__main__nodata__img"
                  src={noFile}
                />
                <div className="theme-list-page__main__nodata__text">
                  {'暂无任何内容哦'}
                </div>
              </div>
            ) : (
              listToRender.map((item, index) =>
                item ? (
                  <ThemeCard
                    className="theme-list-page__main__card-container"
                    key={index}
                    onPreview={(event) => this._handlePreview(event, index)}
                    themePoster={item.poster}
                    auditStatus={item.auditStatus}
                    name={item.name}
                    loading={!item}
                    themeId={item._id}
                    count={item.count}
                    index={index}
                    current={current}
                    isPopular={isPopular}
                    isTheme={isTheme}
                    onCopy={(event) => onCopy(event, item._id)}
                    onRename={() => onRename(isTheme ? item._id : item)}
                    onDelete={() => onDelete(isTheme ? item._id : item)}
                    onOpen={() =>
                      onOpen(item.category, 'themeGroup', userDeptId, item._id)
                    }
                    onCreateProject={(event) =>
                      onCreateProject(
                        event,
                        item._id,
                        item.revisionData.componentPlat || 'h5',
                        item
                      )
                    }
                    onEdit={(event) => onEdit(event, item._id, item.ruleId)}
                    onExamine={() => {
                      onExamine(item);
                    }}
                  ></ThemeCard>
                ) : null
              )
            )}
          </div>
        )}
        {typeof total === 'number' &&
          typeof current === 'number' &&
          total > 1 && (
            <HEPagination
              className="theme-list-page__main__pagination"
              style={styles.pagination}
              current={current}
              total={Math.ceil(total)}
              onPageChange={goToPage}
            />
          )}
        {previewTarget && (
          <HEThemePreview
            onClose={this._handlePreviewClose}
            themeInfo={themeInfo}
            onCreateProject={(event) =>
              onCreateProject(
                event,
                themeInfo._id,
                themeInfo.revisionData.componentPlat || 'h5',
                themeInfo
              )
            }
          />
        )}
      </div>
    );
  }
}

export default ThemeList;
