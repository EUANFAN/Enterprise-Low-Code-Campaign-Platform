import React from 'react';
import Moment from 'moment';
import QRCode from 'qrcode.react';
import { Tooltip } from 'antd';
import { HEModal, HEModalContent, HEModalHeader } from 'components/HEModal';
import HEButton from 'components/HEButton';
import { Label, Row, Text } from 'components/HERow';
import HESkyLayer from 'components/HESkyLayer';
import './index.less';
import { getRuleData } from 'apis/RuleAPI';
import MiniLogo from 'static/imgs/minilogo.png';
class HEThemePreview extends React.Component {
  state = {
    sGroupId: '',
  };
  async componentDidMount() {
    const ruleId = this.props.themeInfo.ruleId || '';
    if (ruleId) {
      // 是规则模板
      try {
        const res = await getRuleData('prod', ruleId);
        if (res.code == 0 && res.data && res.data.sGroupId) {
          this.setState({ sGroupId: res.data.sGroupId });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  render() {
    const {
      onClose,
      themeInfo: {
        ruleId,
        name,
        createdAt,
        _id,
        lastModified,
        ownerId,
        origin,
        application,
        desc,
        caseUrl
      },
      onCreateProject,
    } = this.props;
    const createdAtString = createdAt
      ? Moment(createdAt).format('YYYY-MM-DD HH:mm:ss')
      : '--';
    const lastModifiedString = lastModified
      ? Moment(lastModified).format('YYYY-MM-DD HH:mm:ss')
      : '--';
    let previewTargetUrl = `${god.location.origin}/project/preview?id=${_id}&isTheme=true`;
    previewTargetUrl = ruleId
      ? `${previewTargetUrl}&ruleId=${ruleId}&type=gray`
      : previewTargetUrl;
    return (
      <HESkyLayer onOverlayClick={onClose} className={'theme-preview-skylayer'}>
        <HEModal className="theme-preview-modal">
          <HEModalHeader title={'模板预览'} onClose={onClose} />
          <HEModalContent className="theme-preview-modal__content">
            <iframe
              className="theme-preview-modal__content__iframe"
              src={previewTargetUrl}
            />
            <div className="theme-preview-modal__content__info-section">
              <div className="theme-preview-modal__content__info-section__text">
                <Row>
                  <Label>{'模板名称'}：</Label>
                  <Text>{name}</Text>
                </Row>
                {desc && (
                  <Row>
                    <Label>{'模板描述'}：</Label>
                    <Text>{desc}</Text>
                  </Row>
                )}
                {caseUrl && (
                  <Row>
                    <Label>{'演示案例'}：</Label>
                    <Text>
                      <Tooltip title={caseUrl}>
                        <QRCode
                          value={caseUrl}
                          size={100}
                          imageSettings={{
                            src: MiniLogo,
                            x: null,
                            y: null,
                            height: 17,
                            width: 17
                          }}
                        />
                      </Tooltip>
                    </Text>
                  </Row>
                )}
                <Row>
                  <Label>{'模板ID'}：</Label>
                  <Text
                    style={{
                      userSelect: 'text',
                    }}
                  >
                    {_id}
                  </Text>
                </Row>
                {this.state.sGroupId && (
                  <Row>
                    <Label>{'线上sGroupId'}: </Label>
                    <Text>{this.state.sGroupId}</Text>
                  </Row>
                )}
                <Row>
                  <Label>{'创建时间'}：</Label>
                  <Text>{createdAtString}</Text>
                </Row>
                <Row>
                  <Label>{'最新修改时间'}：</Label>
                  <Text>{lastModifiedString}</Text>
                </Row>
                <Row>
                  <Label>{'拥有者'}：</Label>
                  <Text>{ownerId}</Text>
                </Row>
                <Row>
                  <Label>{'应用范围'}：</Label>
                  <Text>{application ? application : '--'}</Text>
                </Row>
              </div>
              <div className="theme-preview-modal__content__info-section__bottom">
                <HEButton onClick={onCreateProject}>{'立即应用'}</HEButton>
              </div>
            </div>
          </HEModalContent>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default HEThemePreview;
