/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-05-25 01:28:36
 * @LastEditors: jielang
 * @LastEditTime: 2020-06-12 05:09:54
 */
import './index.less';
import React from 'react';
import { observer } from 'mobx-react';
// import WidgetContainer from './WidgetContainer';
import { Modal } from 'antd';
import HEButton from 'components/HEButton';
import HEInput from 'components/HEInput';
import Moment from 'moment';

function Row(props) {
  const { children, ...elseProps } = props;
  return (
    <div {...elseProps} className="appro-confirm-box__row">
      {children}
    </div>
  );
}

function Label(props) {
  return (
    <label className="appro-confirm-box__row__label">{props.children}</label>
  );
}

function Text(props) {
  const { children, ...elseProps } = props;
  return (
    <span {...elseProps} className="appro-confirm-box__row__text">
      {children}
    </span>
  );
}

@observer
class ApproComfirm extends React.Component {
  state = {
    approConfirmVisible: false,
    pagination: {},
    add_content: '',
  };
  show = () => {
    this.setState({
      approConfirmVisible: true,
    });
  };
  onCancel = () => {
    this.setState({
      approConfirmVisible: false,
    });
  };
  onContentChange = (event) => {
    let value = event.target.value;
    this.setState({
      add_content: value,
    });
    return;
  };
  render() {
    const { onAppro, project, userInfo } = this.props;
    const { add_content } = this.state;
    return this.state.approConfirmVisible ? (
      <Modal
        title="审核信息确认"
        visible={this.state.approConfirmVisible}
        footer={null}
        width={638}
        maskClosable={true}
        onCancel={this.onCancel}
        wrapClassName="appro-confirm-box"
        centered
      >
        <div className="appro-confirm-box__body">
          <Row>
            <Label>{'特别注意'}：</Label>
            <Text>
              {'默认提交最新版本的页面内容进行提审，审核通过后自动发布页面。'}
            </Text>
          </Row>
          <Row>
            <Label></Label>
            <Text>
              {
                '提审后锁定页面版本，对页面的任何修改无法影响本次页面发布的版本。'
              }
            </Text>
          </Row>
          <Row>
            <Label></Label>
            <Text>{'审核人员默认为组织架构上级'}</Text>
          </Row>
          <Row>
            <Label>{'审核地址'}：</Label>
            <Text>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="http://appro.xueersi.com"
              >
                http://appro.xueersi.com
              </a>
            </Text>
          </Row>
          <Row>
            <Label>{'申请人'}：</Label>
            <Text>{userInfo.userId}</Text>
          </Row>
          <Row>
            <Label>{'项目名称'}：</Label>
            <Text>{god.PageData.project.name}</Text>
          </Row>
          <Row>
            <Label>{'上线时间'}：</Label>
            <Text>
              {Moment(project.runingStartTime).format('YYYY-MM-DD HH:mm:ss')}
            </Text>
          </Row>
          <Row>
            <Label>{'下线时间'}：</Label>
            <Text>
              {Moment(project.runingEndTime).format('YYYY-MM-DD HH:mm:ss')}
            </Text>
          </Row>
          <Row>
            <Label>{'附加描述'}：</Label>
            <HEInput
              value={add_content}
              onChange={this.onContentChange}
              className=""
              placeholder={'非必填'}
              type="text"
            />
          </Row>
          <Row
            style={{
              'justify-content': 'flex-end',
              'padding-top': '20px',
              'padding-bottom': '30px',
            }}
          >
            {/* <HEButton
              outline={true}
              secondary={true}
              onClick={this.onCancel}
              sizeType={"small"}
            >
              {"取消"}
            </HEButton> */}
            <HEButton
              sizeType={'small'}
              onClick={onAppro.bind(null, 1, {
                a: project.runingStartTime,
                b: project.runingEndTime,
                add_content,
              })}
            >
              {'确定提审'}
            </HEButton>
          </Row>
        </div>
      </Modal>
    ) : null;
  }
}
export default ApproComfirm;
