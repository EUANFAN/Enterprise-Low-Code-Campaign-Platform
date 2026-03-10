/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:03:13
 */
import React from 'react';
import QRCode from 'qrcode.react';
import { HEModal, HEModalContent, HEModalHeader } from 'components/HEModal';
import { getRuleData } from 'apis/RuleAPI';
import HESkyLayer from 'components/HESkyLayer';
import MiniLogo from 'static/imgs/minilogo.png';
import Moment from 'moment';
import { handerRuleUrl } from 'common/utils';
import './index.less';
import { getMiniConfig } from 'common/miniProgram';
class ProjectPreviewModal extends React.Component {
  state = {
    sGroupId: ''
  };
  async componentDidMount() {
    const { project } = this.props;
    if (project.ruleWidget && project.ruleWidget.type) {
      // 是规则项目
      try {
        const res = await getRuleData('prod', project._id);
        if (res.code == 0 && res.data && res.data.sGroupId) {
          this.setState({ sGroupId: res.data.sGroupId });
        }
      } catch (error) {
        console.log(error);
      }
    }
    let componentPlat = (project && project['componentPlat']) || 'h5';
    if (componentPlat === 'miniProgram') {
      this.setMiniProgram();
    }
  }
  async setMiniProgram() {
    const { project, id } = this.props;
    const programList = await getMiniConfig();
    let miniProgramId = project.miniProgramId || programList[0]?.id;
    const programItem = programList.find((item) => item.id === miniProgramId);
    let miniCodeUrl = '';
    let miniPreview = `${programItem.codeUrl}&p=${id.slice(0, 8)}&penv=preview`;
    miniCodeUrl = project.ruleId
      ? handerRuleUrl(miniPreview, project.ruleId, 'gray')
      : miniPreview;
    this.setState({
      miniCodeUrl
    });
  }
  render() {
    // 此处的id 没取 project，是因为 project 在项目列表来源于 revisionData,在编辑区域来源于 store
    const { url, onClose, project, id, target, remoteUrl } = this.props;
    // 此处添加参数是为了预览的时候走规则的草稿箱
    const newUrl = remoteUrl ? handerRuleUrl(remoteUrl, id) : url;
    const modalTitle =
      project && project.editorType == 'theme' ? '模板' : '项目';
    let componentPlat = (project && project['componentPlat']) || 'h5';
    const { miniCodeUrl } = this.state;
    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="project-preview-modal">
          <HEModalHeader
            title={`${modalTitle}预览`}
            onClose={onClose}
            className="project-preview-modal__title"
          />
          <HEModalContent className="project-preview-modal__content">
            <iframe
              className="project-preview-modal__content__iframe"
              src={newUrl}
              width="375"
            />
            <div className="project-preview-modal__content__info">
              <dl>
                <dt>{`${modalTitle}ID：`}</dt>
                <dd>{id}</dd>
              </dl>
              {project.ruleWidget && project.ruleWidget.type && project._id && (
                <dl>
                  <dt>ruleId：</dt>
                  <dd>{project._id}</dd>
                </dl>
              )}
              {this.state.sGroupId && (
                <dl>
                  <dt>线上sGroupId：</dt>
                  <dd>{this.state.sGroupId}</dd>
                </dl>
              )}
              {/* target == data 兼容数据看版页面的预览 */}
              {!target && project ? (
                <React.Fragment>
                  <dl>
                    <dt>{`${modalTitle}名称：`}</dt>
                    <dd>{project.name}</dd>
                  </dl>
                  {project.editorType != 'theme' ? (
                    <React.Fragment>
                      <dl>
                        <dt>上线时间</dt>
                        <dd>
                          {Moment(
                            project?.revisionData?.runingStartTime
                          ).format('YYYY-MM-DD HH:mm:ss')}
                        </dd>
                      </dl>
                      <dl>
                        <dt>下线时间：</dt>
                        <dd>
                          {Moment(project?.revisionData?.runingEndTime).format(
                            'YYYY-MM-DD HH:mm:ss'
                          )}
                        </dd>
                      </dl>
                    </React.Fragment>
                  ) : null}
                  <dl>
                    <dt>创建时间：</dt>
                    <dd>
                      {Moment(project.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </dd>
                  </dl>
                  <dl>
                    <dt>最新发布时间：</dt>
                    <dd>
                      {Moment(project.lastPublished).format(
                        'YYYY-MM-DD HH:mm:ss'
                      )}
                    </dd>
                  </dl>
                  <dl>
                    <dt>最新修改时间：</dt>
                    <dd>
                      {Moment(project.lastModified).format(
                        'YYYY-MM-DD HH:mm:ss'
                      )}
                    </dd>
                  </dl>
                  <dl>
                    <dt>{`${modalTitle}拥有者：`}</dt>
                    <dd>{project && project.ownerId}</dd>
                  </dl>
                </React.Fragment>
              ) : null}
              <dl>
                <dt>{`${modalTitle}二维码：`}</dt>
                <dd>
                  <div className="project-preview-modal__content__qrcode-section">
                    {componentPlat == 'miniProgram' ? (
                      miniCodeUrl && (
                        <QRCode
                          value={miniCodeUrl}
                          size={68}
                          imageSettings={{
                            src: MiniLogo,
                            x: null,
                            y: null,
                            height: 17,
                            width: 17
                          }}
                        />
                      )
                    ) : (
                      <QRCode value={newUrl} size={68} />
                    )}
                    <div className="project-preview-modal__content__qrcode-section__text">
                      <p>{'扫一扫，可在手机看效果'}</p>
                      <p>{'温馨提示：需连接接办公区wifi哦！'}</p>
                    </div>
                  </div>
                </dd>
              </dl>
            </div>
          </HEModalContent>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default ProjectPreviewModal;
