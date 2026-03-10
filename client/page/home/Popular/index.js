/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-06-05 18:24:39
 * @LastEditors: jielang
 * @LastEditTime: 2021-06-05 18:30:09
 */
import 'globals';
import React from 'react';
import { getPopularThemes } from 'apis/ThemeAPI';
import { connectModal } from 'context/feedback';
import ThemeList from './../ThemeList';
import './index.less';
import QueryString from 'common/queryString';
import HELoading from 'components/HELoading';
import HELoadingFalse from 'components/HELoading/loadingFalse';
import classNames from 'classnames';

const DEFAULT_THEMES = [];
const PAGE_SIZE = 10;
class Popular extends React.Component {
  state = {
    hover: false,
    loading: true,
    carousels: [
      {
        src:
          god.lang == 'en'
            ? require('./imgs/home_banner_en.png')
            : require('./imgs/home_banner.png'),
        link: '#',
      },
    ],
    popularThemes: DEFAULT_THEMES,
    error: null,
    current: null,
    total: null,
    themeGroup: '',
  };

  _handleMouseEnter = () => {
    this.setState({ hover: true });
  };

  _handleMouseLeave = () => {
    this.setState({ hover: false });
  };
  _handleSearch = (event) => {
    const value = event.target.value;
    const keyword = value.trim();
    const { history, location } = this.props;
    const params = QueryString.stringify(
      Object.assign(QueryString.parse(location.search), { search: keyword })
    );
    history.push(`${location.pathname}?${params}`);
  };
  async UNSAFE_componentWillMount() {
    await this._fetchPopularTheme();
  }
  _fetchPopularTheme = async () => {
    const { auditStatus, search, current, themeGroup } = QueryString.parse(
      location.search
    );
    this.setState({ loading: true });
    try {
      const { list, total } = await getPopularThemes(
        current,
        PAGE_SIZE,
        search,
        auditStatus,
        themeGroup
      );
      const popularThemes = list.map((item) => {
        return { ...item, count: item.count };
      });
      this.setState({
        popularThemes,
        loading: false,
        total,
        themeGroup: themeGroup || '',
        current: parseInt(current, PAGE_SIZE) || 1,
      });
    } catch (e) {
      this.setState({ error: true });
    }
  };
  _handlePageChange = async (event, pageNumber) => {
    const {
      location: { search, pathname },
      history,
    } = this.props;
    const { current } = this.state;
    if (pageNumber === current) {
      return;
    }
    const { page, ...others } = QueryString.parse(search); // eslint-disable-line no-unused-vars
    history.push(
      `${pathname}?${QueryString.stringify({ ...others, current: pageNumber })}`
    );
  };
  _handleAuditStatus = async () => {
    const {
      location: { search, pathname },
      history,
    } = this.props;
    const { auditStatus, ...others } = QueryString.parse(search); // eslint-disable-line no-unused-vars
    history.push(
      `${pathname}?${QueryString.stringify({ ...others, auditStatus })}`
    );
  };
  handleThemeGroupClick = (themeGroup) => {
    const {
      location: { search, pathname },
      history,
    } = this.props;
    const { current, ...others } = QueryString.parse(search); // eslint-disable-line no-unused-vars
    history.push(
      `${pathname}?${QueryString.stringify({
        ...others,
        current: 1,
        themeGroup: themeGroup,
      })}`
    );
  };
  render() {
    const { onCreateProject, drawerData } = this.props;
    let themeGroupList =
      drawerData.find((item) => item.key === 'landingPage').groups || [];
    if (themeGroupList.length) {
      themeGroupList = [{ name: '全部', _id: '' }, ...themeGroupList];
    }
    const { popularThemes, loading, error, total, current, themeGroup } =
      this.state;
    if (loading) {
      return <HELoading />;
    }
    if (error) {
      return <HELoadingFalse />;
    }
    return (
      <div className="popular-wrapper">
        <div className="theme-group-wrapper">
          <ul className="theme-group-list">
            <li className="theme-group-first">用途：</li>
            {themeGroupList.map((item) => (
              <li
                key={item.name}
                className={classNames([
                  'theme-group-item',
                  { 'theme-group-item-active': item._id === themeGroup },
                ])}
                onClick={() => this.handleThemeGroupClick(item._id)}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
        <ThemeList
          onCreateProject={onCreateProject}
          loading={loading}
          list={popularThemes}
          listToRender={popularThemes}
          error={error}
          total={total}
          current={current}
          goToPage={this._handlePageChange.bind(this)}
          onSearch={this._handleSearch}
          isPopular={true}
          isTheme={true}
        ></ThemeList>
      </div>
    );
  }
}

export default connectModal(Popular);
