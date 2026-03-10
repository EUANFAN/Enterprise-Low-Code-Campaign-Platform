import React from 'react';
import Moment from 'moment';

import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import HEInput from 'components/HEInput';
import { toastError, toastSuccess } from 'components/HEToast';
import HESkyLayer from 'components/HESkyLayer';
import { noop } from 'utils/FunctionUtils';
import './index.less';
import { COMPONENT_PLATS } from 'common/constants';
import { Button, DatePicker, Tooltip } from 'antd';
import { getOnlineUrl, handerRuleUrl } from '../../../common/utils';
import ClipboardUtils from '../../../utils/ClipboardUtils';
import {
  getDefaultMiniProgramId,
  getMiniProgramConfig
} from 'common/miniProgram';
import classNames from 'classnames';
import MiniLogo from '../../../static/imgs/minilogo.png';
import QRCode from 'qrcode.react';
import HEProjectTag from 'components/HEProjectTag';

function Row(props) {
  return (
    <div className="theme-info-modal-project__content__row">
      {props.children}
    </div>
  );
}

function Label(props) {
  return (
    <label
      style={{ verticalAlign: props.verticalAlign ? 'top' : '' }}
      className="theme-info-modal-project__content__row__label"
    >
      {props.children}
    </label>
  );
}

function Text(props) {
  const className = classNames(
    ['theme-info-modal-project__content__row__text'],
    { ellipsis: props.ellipsis }
  );
  const { children, ...elseProps } = props;
  return (
    <span {...elseProps} className={className}>
      {children}
    </span>
  );
}

export default class ProjectInfoModal extends React.Component {
  static defaultProps = {
    onClose: noop,
    onSubmit: noop
  };

  constructor(props) {
    super(props);
    console.log('targetModalInfo---', props.targetModalInfo);
    const {
      name: currentName,
      targetModalInfo: {
        revisionData: { runingEndTime, runingStartTime }
      }
    } = props;
    this.state = {
      h5Url: '',
      miniProgramId: '',
      miniUrlObj: {},
      componentPlat:
        props.targetModalInfo?.revisionData?.componentPlat ||
        props.targetModalInfo?._themes[0]?.revisionData?.componentPlat ||
        'h5', // 可能是有模板的规则小程序
      currentName,
      runingStartTime: Moment(runingStartTime),
      runingEndTime: Moment(runingEndTime),
      tags: this.props.targetModalInfo.tags || []
    };
  }
  componentDidMount() {
    this.getH5Link();
    if (this.state.componentPlat === 'miniProgram') {
      this.setMiniProgram();
    }
  }
  // 注入小程序信息
  async setMiniProgram() {
    // 判断为小程序项目才执行该方法
    const { targetModalInfo: obj } = this.props;
    let miniProgramId = obj.revisionData?.miniProgramId;
    const isRule = obj.ruleWidget;
    if (!miniProgramId) {
      miniProgramId = await getDefaultMiniProgramId();
    }
    const miniUrlObj = await getMiniProgramConfig(
      isRule ? 'rule' : 'common', // 这里要区分是否为常规小程序
      miniProgramId,
      isRule ? obj._themeId : obj._id,
      isRule ? obj._id : ''
    );
    this.setState({ miniProgramId, miniUrlObj });
  }
  _handleNameChange = (event) => {
    const newTarget = event.target.value;
    this.setState({ currentName: newTarget.trim() });
  };

  _handleSubmit = (event) => {
    const { currentName, tags, runingStartTime, runingEndTime } = this.state;

    // 所有项目可修改 name 和 tag
    if (!currentName) return toastError('项目名称不能为空');
    if (!tags.length) return toastError('项目用途不能为空');

    if (!this.props.targetModalInfo.remoteUrl) {
      // 小程序或h5可以修改上下线时间
      if (!runingStartTime) return toastError('上线时间不能为空');
      if (!runingEndTime) return toastError('下线时间不能为空');
      if (runingEndTime.valueOf() <= runingStartTime.valueOf())
        return toastError('下线时间不能早于上线时间');
    }
    const options = {
      name: currentName,
      tags,
      runingStartTime: runingStartTime.toISOString(),
      runingEndTime: runingEndTime.toISOString()
    };
    this.props.onSubmit(event, options);
  };

  _getComponentPlat = (componentPlat = 'h5') => {
    return COMPONENT_PLATS.find((item) => {
      return item.value === componentPlat;
    });
  };
  disabledEndDate = (runingEndTime) => {
    const { runingStartTime } = this.state;
    if (!runingEndTime || !runingStartTime) {
      return false;
    }
    const now = new Date().getTime();
    return (
      runingEndTime.valueOf() <= runingStartTime.valueOf() ||
      runingEndTime.valueOf() < now
    );
  };
  onStartChange = (value) => {
    this.setState({ runingStartTime: value });
  };
  onEndChange = (value) => {
    this.setState({ runingEndTime: value });
  };
  getH5Link = async () => {
    const { _id: projectId, origin, remoteUrl } = this.props.targetModalInfo;
    const { componentPlat } = this.state;
    if (remoteUrl) {
      this.setState({
        h5Url: handerRuleUrl(remoteUrl, projectId)
      });
    } else {
      let { currentUrl } = await getOnlineUrl('', {
        _id: projectId,
        origin: origin,
        componentPlat: componentPlat || 'h5'
      });
      this.setState({
        h5Url: currentUrl
      });
    }
  };
  _handleOpen = (url) => {
    const { onOpenInNewTab } = this.props;
    try {
      god.open(url);
      onOpenInNewTab && onOpenInNewTab();
    } catch (err) {
      onOpenInNewTab && onOpenInNewTab(err);
    }
  };
  _handleTextCopy = async (text) => {
    try {
      await ClipboardUtils.copyTextToClipboard(text);
      toastSuccess('已复制到剪贴板');
    } catch (err) {
      toastError(err.message);
    }
  };
  _handleTagsChange(selectValue) {
    this.setState({
      tags: selectValue
    });
  }
  render() {
    const {
      onClose,
      createdAt,
      lastModified,
      lastPublished,
      owner,
      _id,
      ruleWidget,
      targetModalInfo: {
        remoteUrl,
        revisionData: { runingStartTime, runingEndTime }
      }
    } = this.props;
    const {
      currentName,
      componentPlat,
      h5Url,
      miniProgramId,
      miniUrlObj,
      tags
    } = this.state;

    const createdAtString = createdAt
      ? Moment(createdAt).format('YYYY-MM-DD HH:mm:ss')
      : '--';
    const lastModifiedString = lastModified
      ? Moment(lastModified).format('YYYY-MM-DD HH:mm:ss')
      : '--';
    const lastPublishedString = lastPublished
      ? Moment(lastPublished).format('YYYY-MM-DD HH:mm:ss')
      : '--';

    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="theme-info-modal-project">
          <HEModalHeader title={'项目信息'} onClose={onClose} />
          <HEModalContent className="theme-info-modal-project__content">
            <Row>
              <Label>{'项目名称'}：</Label>
              <HEInput
                value={currentName}
                onChange={this._handleNameChange}
                className="theme-info-modal-project__content__row__input"
                type="text"
                maximumLetters={20}
                placeholder={'请输入名称'}
              />
            </Row>
            <Row>
              <Label>{'项目ID'}：</Label>
              <Text
                style={{
                  userSelect: 'text'
                }}
              >
                {_id}
              </Text>
            </Row>
            <Row>
              <Label>{'创建时间'}：</Label>
              <Text>{createdAtString}</Text>
            </Row>
            <Row>
              <Label>{'最新修改时间'}：</Label>
              <Text>{lastModifiedString}</Text>
            </Row>
            <Row>
              <Label>{'最近发布时间'}：</Label>
              <Text>{lastPublishedString}</Text>
            </Row>
            <Row>
              <Label>{'项目类型'}：</Label>
              <Text>{this._getComponentPlat(componentPlat).key}</Text>
            </Row>
            <Row>
              <Label>{'项目用途'}：</Label>
              <HEProjectTag
                value={tags}
                onSelect={this._handleTagsChange.bind(this)}
                width="195px"
              />
            </Row>

            {lastPublished && (
              <Row>
                <Label>{'H5链接'}：</Label>
                <div
                  style={{
                    display: 'inline-block',
                    width: '180px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Tooltip title={h5Url}>
                    <Text ellipsis="true">{h5Url}</Text>
                  </Tooltip>
                  <Button
                    style={{ padding: '0 5px' }}
                    type="link"
                    onClick={this._handleTextCopy.bind(this, h5Url)}
                  >
                    复制
                  </Button>
                  <Button
                    style={{ padding: 0 }}
                    type="link"
                    onClick={this._handleOpen.bind(this, h5Url)}
                  >
                    打开
                  </Button>
                </div>
              </Row>
            )}
            {componentPlat === 'miniProgram' && (
              <>
                <Row>
                  <Label>{'小程序ID'}：</Label>
                  <div
                    style={{
                      display: 'inline-block',
                      width: '180px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Text>{miniProgramId}</Text>
                    <Button
                      style={{ padding: '0 5px' }}
                      type="link"
                      onClick={this._handleTextCopy.bind(this, miniProgramId)}
                    >
                      复制
                    </Button>
                  </div>
                </Row>
                <Row>
                  <Label>{'小程序基础路径'}：</Label>
                  <div
                    style={{
                      display: 'inline-block',
                      width: '180px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Tooltip title={miniUrlObj.miniProgramUrl}>
                      <Text ellipsis="true">{miniUrlObj.miniProgramUrl}</Text>
                    </Tooltip>
                    <Button
                      style={{ padding: '0 5px' }}
                      type="link"
                      onClick={this._handleTextCopy.bind(
                        this,
                        miniUrlObj.miniProgramUrl
                      )}
                    >
                      复制
                    </Button>
                  </div>
                </Row>
              </>
            )}
            <Row>
              <Label>{'上线时间'}：</Label>
              {remoteUrl ? (
                <Text>外部链接页面，无法控制上线时间</Text>
              ) : (
                <DatePicker
                  showTime
                  disabledDate={this.disabledStartDate}
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder={'选择上线时间'}
                  onChange={this.onStartChange}
                  defaultValue={Moment(runingStartTime)}
                />
              )}
            </Row>
            <Row>
              <Label>{'下线时间'}：</Label>
              {remoteUrl ? (
                <Text>外部链接页面，无法控制下线时间</Text>
              ) : (
                <DatePicker
                  showTime
                  disabledDate={this.disabledEndDate}
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder={'选择下线时间'}
                  onChange={this.onEndChange}
                  defaultValue={Moment(runingEndTime)}
                />
              )}
            </Row>
            <Row>
              <Label>{'拥有者'}：</Label>
              <Text>{owner}</Text>
            </Row>
            {ruleWidget && (
              <Row>
                <Label>{'使用规则'}：</Label>
                <Text>
                  {ruleWidget.type} - {ruleWidget.version}
                </Text>
              </Row>
            )}
            {componentPlat === 'miniProgram' && miniUrlObj.miniCodeUrl && (
              <Row>
                <Label verticalAlign="top">{'小程序码'}：</Label>
                <div
                  style={{
                    display: 'inline-block',
                    width: '180px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Tooltip title={miniUrlObj.miniCodeUrl}>
                    <QRCode
                      value={miniUrlObj.miniCodeUrl}
                      size={68}
                      imageSettings={{
                        src: MiniLogo,
                        x: null,
                        y: null,
                        height: 17,
                        width: 17
                      }}
                    />
                  </Tooltip>
                </div>
              </Row>
            )}
          </HEModalContent>
          <HEModalActions>
            <HEButton onClick={this._handleSubmit}>{'确定'}</HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}
