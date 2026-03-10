import React from 'react';
import { Card, Icon, Button } from 'antd';
import { observer } from 'mobx-react';
import VariablePicker from '../HEVariablePicker';
import { getWidgetVariable } from 'common/utils';
import './index.less';

@observer
class ConditionPanel extends React.Component {
  render() {
    const { element, project } = this.props;
    let widgetType = element.type;
    let variable = element.condition || '';
    return (
      <div style={{ margin: 10 }}>
        <VariablePicker
          widgetType={widgetType}
          project={project}
          ref={(node) => {
            this.variablePicker = node;
          }}
        />
        <Card
          title="变量"
          extra={<Button onClick={this.onChangeExpression}>输入条件</Button>}
        >
          {variable ? (
            <div
              className="expression"
              type="primary"
              onClick={this.onChangeExpression}
            >
              {variable}
              <Icon
                type="close"
                className="close"
                onClick={this.deleteCondition}
              />
            </div>
          ) : (
            <Button onClick={this.onChangeExpression}>输入条件</Button>
          )}
        </Card>
        <Button
          style={{ width: '100%', marginTop: 10 }}
          onClick={this.deleteCondition}
        >
          清除条件
        </Button>
      </div>
    );
  }

  // 变量选择
  onChangeExpression = () => {
    const { element } = this.props;
    const condition = element.condition;
    this.variablePicker.show(
      condition,
      getWidgetVariable(element.path),
      (value) => {
        let { content } = value;
        element.modify({
          condition: content,
        });
      },
      element.path
    );
  };

  deleteCondition = async (e) => {
    let { element } = this.props;
    element.modify({
      condition: '',
    });
    e.stopPropagation();
  };
}

export default ConditionPanel;
