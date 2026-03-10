import React from 'react';
import classNames from 'classnames';
import { HECard } from 'components/HECard';
import CreatePage from '../CreatePage';
import { noop } from 'utils/FunctionUtils';
import './index.less';

export default class AddBlankCard extends React.Component {
  static defaultProps = {
    onClick: noop,
  };
  render() {
    const className = classNames('add-blank-card', this.props.className);
    return (
      <HECard className={className}>
        <CreatePage title={this.props.desc} onClick={this.props.onClick} />
      </HECard>
    );
  }
}
