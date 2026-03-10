import React from 'react';
// import _ from 'lodash';
import HESearchInput from 'components/HESearchInput';
import { Select } from 'antd';
const { Option } = Select;
import { validateRoleLimit } from 'common/utils';
import './index.less';
export default class HESelect extends React.Component {
  constructor() {
    super();
  }
  static defaultProps = {
    placeholder: '',
    defaultSearchValue: '',
    defaultSelectValue: '',
    onSearch: () => {},
    onSelect: () => {},
  };
  _handleItemSelect = (value) => {
    this.props.onSelect(value);
  };
  render() {
    const {
      onSearch,
      defaultSearchValue,
      defaultSelectValue,
      options,
      placeholder,
    } = this.props;
    return (
      <>
        <div className="he-select-container">
          {validateRoleLimit('addTheme') && (
            <Select
              defaultValue={defaultSelectValue}
              style={{ width: 120 }}
              onChange={this._handleItemSelect}
            >
              {options.map(({ text, value }) => (
                <Option value={value} key={value}>
                  {text}
                </Option>
              ))}
            </Select>
          )}
        </div>
        <div className="he-input-select">
          <HESearchInput
            defaultValue={defaultSearchValue}
            className="create-theme-modal__content__row__input he-select-search"
            type="text"
            placeholder={placeholder}
            onSearch={onSearch}
          />
        </div>
      </>
    );
  }
}
