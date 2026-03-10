/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-12-22 22:04:06
 * @LastEditors: jielang
 * @LastEditTime: 2020-12-22 22:58:41
 */
import React from 'react';
import HESearchInput from 'components/HESearchInput';
import HESelect from 'components/HESelect';
import QueryString from 'common/queryString';
import { DatePicker } from 'antd';
import './index.less';

const { RangePicker } = DatePicker;

export default class HEActionBar extends React.Component {
  state = {
    searchParams: {},
  };

  _handleProjectStatusSelect = (event, status) => {
    let newSearchParams = this.state.searchParams;
    newSearchParams.status = status;
    this.setState({
      searchParams: newSearchParams,
    });
  };

  render() {
    const {
      searchParams: { status },
    } = this.state;
    const { _handleSearch, location } = this.props;
    const { search } = QueryString.parse(location.search);
    const options = [
      {
        key: '全部',
        value: '',
      },
      {
        key: '配置中',
        value: 0,
      },
      {
        key: '已上线',
        value: 1,
      },
    ];
    return (
      <div className="he-search-bar">
        <label>项目状态</label>
        <HESelect
          value={status}
          onSelect={this._handleProjectStatusSelect}
          className="project-search__content"
          style={{
            width: '330px',
            height: '32px',
          }}
          options={options}
        ></HESelect>
        <label>创建日期</label>
        <RangePicker
          showTime
          format="YYYY-MM-DD"
          placeholder={['开始日期', '结束日期']}
          style={{
            width: '330px',
            height: '32px',
            margin: '0 20px 0 10px',
          }}
        />
        {/* <DatePicker
          showTime
          format='YYYY-MM-DD'
          placeholder={['开始日期', '结束日期']}
          // value={Moment(value || Date.now())}
          style={{
            width: '330px',
            height: '32px',
            margin: '0 20px 0 10px'
          }}
        /> */}
        <label>搜索</label>
        <HESearchInput
          placeholder={'网页标题、项目名或项目号'}
          key={search}
          defaultValue={search}
          onSearch={_handleSearch}
          className="project-search__content"
        ></HESearchInput>
      </div>
    );
  }
}
