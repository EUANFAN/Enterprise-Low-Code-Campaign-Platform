import React from 'react';
import { getWidgetList } from 'apis/WidgetAPI';
import HESelect from 'components/HESelect';

export default class HERuleComponentSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ruleOptions: [],
      selectValue: '',
    };
  }
  async _getRuleWidgetList() {
    const { widgets } = await getWidgetList('', '', 20, '', 'rule');
    const ruleOptions = [];
    widgets.forEach(function (widget) {
      ruleOptions.push({
        value: widget.type + '-' + widget.version,
        key: widget.name,
      });
    });
    this.setState({
      ruleOptions,
    });
  }

  _handleRuleChange(e, selectValue) {
    this.setState({ selectedRule: selectValue });
    this.props.handleRuleChange(selectValue);
  }

  UNSAFE_componentWillMount() {
    this._getRuleWidgetList();
  }
  render() {
    const { ruleOptions, selectedRule } = this.state;
    return (
      <React.Fragment>
        <HESelect
          className="create-project-modal__content__row__select"
          onSelect={this._handleRuleChange.bind(this)}
          options={ruleOptions}
          placeholder={'请选择模板应用的规则'}
          value={selectedRule}
        />
      </React.Fragment>
    );
  }
}
