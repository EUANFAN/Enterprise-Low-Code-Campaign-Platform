import React from 'react'
import { observer } from 'mobx-react'
import merge from 'lodash/merge'
import QRCode from 'qrcode.react'
import { Modal, Tooltip, Switch } from 'antd'
import { HENavbar } from 'components/HENavbar'
import HEButton from 'components/HEButton'
import HEIconButton from 'components/HEIconButton'
import { toastSuccess, toastError, toastLoading } from 'components/HEToast'
import UpdateWidgetVersion from 'components/HEWidgetLibrary/UpdateWidgetVersion'
import Save from 'components/icons/Save'
import Send from 'components/icons/Send'
import Link from 'components/icons/Link'
import Preview from 'components/icons/Preview'
import AuditStatusManage from 'components/AuditStatusManage'
import RuleNavbar from 'components/RuleNavbar'
import ConfirmPublishModal from 'components/ConfirmPublishModal'

import ControlWrap from 'controls/ControlWrap'
import {
  updateRule,
  setConfigData,
  getThemeRuleVersion,
  getRuleData
} from 'apis/RuleAPI'
import { loadTriggerConfig } from 'triggers'

import Rule from 'store/clazz/Rule'
import { validateRoleLimit } from 'common/utils'
import { context, handerRuleUrl } from 'common/utils'
import MiniLogo from 'static/imgs/minilogo.png'
import './App.less'

@observer
@AuditStatusManage
class App extends React.Component {
  state = {
    remoteUrl: '',
    env: 'gray',
    lastRuleVersion: null,
    hasError: false,
    sGroupId: '',
    graySGroupId: '',
    // 高级配置
    showPro: false,
    // 监控的数据
    ruleComponent: null,
    // 传给外部组件的数据
    ruleConfig: {},
    showPublishModal: false
  }

  // 获取除私有字段之外的公共字段
  getPublicData = (config, publicData) => {
    Object.keys(config).forEach((type) => {
      if (config[type].private) {
        // 如果该字段是私人的，则删除该字段
        delete publicData[type]
      }

      if (!config[type].private && config[type].type === 'AssembleList') {
        // 遍历AssembleList是否包含私有字段
        publicData[type].forEach((itemData, index) => {
          publicData[type][index] = this.getPublicData(
            config[type].fields,
            itemData
          )
        })
      }
    })

    return publicData
  }

  // 是否是模板编辑状态
  get isUpdateAuditStatus() {
    // 2 审核成功  0 未审核
    return !this.state.remoteUrl && PageData.rule.auditStatus === 2
  }

  get themeId() {
    return PageData.rule.themeId
  }

  auditStatusManageFinish() {
    PageData.rule.auditStatus = 0
  }

  onSaveRule = async (action, sGroupId = '', publishData) => {
    // TODO: props里没有这个函数.
    this.props.handleTempleteAudit.call(this)

    const { ruleComponent, env } = this.state
    const { data } = ruleComponent
    const { rule } = this.props

    if (sGroupId && data && data.hasOwnProperty('sGroupId') && env === 'prod') {
      // 发布时更新sGroupId,预览时不更新,解决sGroupId不一致的问题
      data['sGroupId'] = sGroupId
      publishData['sGroupId'] = sGroupId
    }

    await updateRule({
      id: rule._id,
      ruleData: publishData ? publishData : ruleComponent.data,
      ruleWidget: {
        type: ruleComponent.type,
        version: ruleComponent.version
      },
      action
    })

    toastSuccess('保存成功！')
  }

  onPreview = async () => {
    const { remoteUrl } = this.state

    this.setState({ env: 'gray' }, async () => {
      let url = new URL(remoteUrl)
      // 保存为草稿箱
      let res = await this.handleEidtorTheme(true, 'update')

      if (res) {
        url.searchParams.set('previewTime', Date.now())
        this.setState({ remoteUrl: url.href })
      }
    })
  }

  // 测试发布.
  handlePublishOnlineTest = () => {
    this.setState({ showPublishModal: false, env: 'gray' }, () => {
      this.handlePublish()
    })
  }

  // 正式发布.
  handlePublishOnline = () => {
    this.setState({ showPublishModal: false, env: 'prod' }, () => {
      this.handlePublish()
    })
  }

  // 发布.
  handlePublish = async () => {
    toastLoading('发布中', 10000)

    let res = await this.handleEidtorTheme(true, 'publish')

    if (res) {
      // 校验项通过
      toastSuccess('发布成功')
      this.getProjectUrl(this.props.rule, true)
    } else {
      toastError('发布失败')
    }
  }

  getProjectUrl = (rule, refresh, showGrayAndProd = false) => {
    let testUrl = handerRuleUrl(rule.remoteUrl, rule._id, 'gray')
    let onlineUrl = handerRuleUrl(rule.remoteUrl, rule._id)
    const miniProgramUrl = PageData.miniProgramUrl
    const miniProgramId = PageData.miniProgramId
    const miniCodeUrl = PageData.miniCodeUrl
    const { sGroupId, graySGroupId, env } = this.state

    Modal.confirm({
      width: '560px',
      title: '提示',
      cancelText: '返回首页',
      content: (
        <React.Fragment>
          {(showGrayAndProd || env == 'gray') && (
            <>
              {
                <p>
                  项目测试链接：
                  <span className="rule-config__preview--info__href">
                    {testUrl}
                  </span>
                </p>
              }
              {graySGroupId && (
                <p>
                  灰度sGroupId：
                  <span className="rule-config__preview--info__href">
                    {graySGroupId}
                  </span>
                </p>
              )}
              {miniProgramUrl && (
                <p>
                  小程序ID：
                  <span className="rule-config__preview--info__href">
                    {miniProgramId}
                  </span>
                </p>
              )}
              {miniProgramUrl && (
                <p>
                  小程序测试基础路径：
                  <span className="rule-config__preview--info__href">
                    {miniProgramUrl + '&type=gray'}
                  </span>
                </p>
              )}
              {miniProgramUrl && (
                <p>
                  小程序测试二维码：
                  <QRCode
                    className="rule-config__preview--info__minicode"
                    value={miniCodeUrl + '&type=gray'}
                    size={100}
                    imageSettings={{
                      src: MiniLogo,
                      x: null,
                      y: null,
                      height: 17,
                      width: 17
                    }}
                  />
                </p>
              )}
            </>
          )}
          {(showGrayAndProd || env == 'prod') && (
            <>
              <p>
                项目线上链接：
                <span className="rule-config__preview--info__href">
                  {onlineUrl}
                </span>
              </p>
              {sGroupId && (
                <p>
                  线上sGroupId：
                  <span className="rule-config__preview--info__href">
                    {sGroupId}
                  </span>
                </p>
              )}
              {miniProgramUrl && (
                <p>
                  小程序ID：
                  <span className="rule-config__preview--info__href">
                    {miniProgramId}
                  </span>
                </p>
              )}
              {miniProgramUrl && (
                <p>
                  小程序基础路径：
                  <span className="rule-config__preview--info__href">
                    {miniProgramUrl}
                  </span>
                </p>
              )}
              {miniProgramUrl && (
                <p>
                  小程序二维码：
                  <QRCode
                    className="rule-config__preview--info__minicode"
                    value={miniCodeUrl}
                    size={100}
                    imageSettings={{
                      src: MiniLogo,
                      x: null,
                      y: null,
                      height: 17,
                      width: 17
                    }}
                  />
                </p>
              )}
            </>
          )}
        </React.Fragment>
      ),
      okText: '知道了',
      onOk() {
        refresh && god.location.reload()
      },
      onCancel() {
        location.href = '/projects/my'
      }
    })
  }

  // 选项校验
  validate() {
    let res = []
    let count = 0
    let { data, config } = this.state.ruleComponent
    let { controlWrapConfig } = this.handleRuleConfig(config)

    if (!controlWrapConfig.length) return true

    controlWrapConfig.forEach((item, index) => {
      let ref = this['controlWrapRef' + index].controlRef
      Object.keys(ref).forEach((attribute) => {
        if (
          item.config[attribute].require &&
          ref[attribute] &&
          ref[attribute].validate &&
          typeof ref[attribute].validate == 'function'
        ) {
          if (!ref[attribute].validate(data[attribute]) && !count++) {
            const errControl = this.getErrControl(
              ref[attribute],
              data[attribute]
            )

            if (!errControl) return

            let {
              props: { attribute: attr, parentAttribute },
              id
            } = errControl

            let query = id
              ? '#' + id + ` .${parentAttribute}-${attr}-control`
              : `.${attr}-control`

            document.querySelector(query) &&
              document.querySelector(query).scrollIntoView({ block: 'center' })
          }

          res.push(ref[attribute].validate(data[attribute]))
        }
      })
    })
    return res.every((item) => item)
  }

  getErrControl(ref, data) {
    let errControl = null
    let flag = true

    if (ref.props.type !== 'AssembleList') return ref

    for (let [inx, cur] of Object.entries(ref.controlArr)) {
      if (!flag) break

      for (let key of Object.keys(cur)) {
        if (cur[key] && cur[key].props.type == 'AssembleList') {
          errControl = this.getErrControl(cur[key], cur[key].list)
          if (errControl) {
            flag = false
            break
          }
        } else if (
          cur[key] &&
          cur[key].validate &&
          !cur[key].validate(data[inx][key])
        ) {
          errControl = Object.assign(cur[key], {
            id: `a-${inx + data[inx].id}`
          })
          flag = false
          break
        }
      }
    }

    return errControl
  }

  // 发布处理.
  handleEidtorTheme = async (isPreview, action) => {
    const { rule } = this.props
    const { env, ruleConfig, ruleComponent } = this.state
    console.log(
      '🚀 ~ file: App.js ~ line 373 ~ App ~ handleEidtorTheme= ~ ruleConfig',
      ruleConfig
    )
    let validateRes = await this._handleValidate()
    // 此处的merge 是为了二次编辑，数据变动后，将可监控的数据merge给外部组件要使用的数据
    const currentData = ruleConfig.data
    let ruleComponentData = ruleComponent.data

    if (ruleComponentData) {
      // for (let currentKey in ruleComponentData) {
      //   if (ruleComponentData[currentKey] !== undefined) {
      //     currentData[currentKey] = ruleComponentData[currentKey]
      //   }
      // }
      Object.keys(currentData).forEach((prop) => {
        currentData[prop] =
          ruleComponentData[prop] !== undefined
            ? ruleComponentData[prop]
            : currentData[prop]
      })
    }

    if (validateRes) {
      try {
        if (
          ruleConfig['beforePublish'] &&
          typeof ruleConfig['beforePublish'] === 'function'
        ) {
          await ruleConfig.beforePublish(context({ project: rule }))
        }
        // 过滤掉规则组件中的隐私字段
        let publicData = null

        // 只有外部组件中有 hasPrivateData 为 true时，才去过滤出所有用户可以见的数据。新增字段的原因：因为涉及到多层AssembleList嵌套时会有性能问题
        if (ruleConfig.hasPrivateData) {
          let commonData = JSON.parse(JSON.stringify(ruleConfig.data))
          publicData = this.getPublicData(ruleConfig.config, commonData)
        }

        const sGroupId = ruleConfig.data.sGroupId
        console.log(
          '🚀 ~ file: App.js ~ line 414 ~ App ~ handleEidtorTheme= ~ ruleConfig',
          ruleConfig
        )

        let result = await setConfigData({
          activityName: rule.name,
          member: rule.ownerId,
          sGroupId: sGroupId || 0,
          ruleId: rule._id,
          config: JSON.stringify(ruleConfig.data),
          publicConfig: publicData && JSON.stringify(publicData),
          type: env,
          business: rule.business || 'clientView'
        })

        if (action == 'publish') {
          this.setState({ sGroupId: result.data.sGroupId })
        }

        // 保存sGroupId
        await this.onSaveRule(action, result.data.sGroupId, ruleConfig.data)

        if (result.code == 0 && !isPreview) {
          location.href = `/editor/theme/${rule.themeId}?ruleId=${rule._id}&type=gray`
        }

        if (result.code != 0) {
          toastError(result.msg)
          return
        }
      } catch (error) {
        console.log('error', error)
        return null
      }
    }

    return validateRes
  }

  _handleValidate() {
    return new Promise((resolve) => {
      let result = this.validate()
      if (!result) {
        toastError('请填写必填项！')
      }
      resolve(result)
    })
  }

  updateRuleVersion(targetWidget, currentConfig) {
    const currentData = currentConfig.data
    const oldData = this.state.ruleComponent.data
    Object.keys(currentData).forEach((prop) => {
      if (oldData[prop] !== undefined) {
        currentData[prop] =
          typeof oldData[prop] == 'object'
            ? merge(currentData[prop], oldData[prop])
            : oldData[prop]
      }
    })
    this.setState({
      hasError: false,
      ruleComponent: new Rule(currentConfig)
    })
  }

  // 获取规则组件配置.
  async getRuleData() {
    const { rule } = this.props
    const result = await getRuleData('prod', rule._id)
    const grayResult = await getRuleData('gray', rule._id)

    if (result.code == 0) {
      this.setState({ sGroupId: result.data.sGroupId })
    }

    if (grayResult.code == 0) {
      this.setState({ graySGroupId: grayResult.data.sGroupId })
    }
  }

  handleRuleConfig(config = {}) {
    let group = []
    let noGroup = {}
    let controlWrapConfig = []
    // 需要排序,未分组的在前面，分组的通过前面序号进行排序
    // forEach((key, index) => {arr[index] = config[key] }) todo:key需要改一下。
    Object.keys(config).forEach((key) => {
      const index = key.indexOf('-')
      if (index !== -1)
        group.push({
          title: key.slice(index + 1),
          config: config[key],
          index: key.slice(0, index)
        })
      else noGroup[key] = config[key]
    })
    group.sort((a, b) => {
      return a.index - b.index
    }) //
    // 情况1 没有分组的 不应该有
    if (group.length == 0) {
      controlWrapConfig = [{ config: config }]
      noGroup = {}
    } // 情况2 全是分组的
    else if (Object.keys(noGroup).length == 0) {
      controlWrapConfig = group
    } // 都有
    else {
      controlWrapConfig = [{ config: noGroup }, ...group]
    }
    return {
      controlWrapConfig,
      navConfig: group.map((item) => item.title) // todo:后续会加未分组
    }
  }

  onChangePro = (showPro) => {
    this.setState({ showPro })
  }

  componentDidCatch(error, info) {
    console.log('error: ', error)
    console.log('info: ', info)
    this.setState({ hasError: true })
  }

  haePro(config) {
    let boolAccount = false
    for (let key in config) {
      const configKeys = Object.keys(config[key])
      if (configKeys.some((item) => item === 'pro' && config[key][item])) {
        return true
      } else if (~configKeys.indexOf('fields')) {
        boolAccount = this.haePro(config[key]['fields'])
        if (boolAccount) return true
      }
    }
    return boolAccount
  }

  judgePro(controlWrapConfig) {
    if (!controlWrapConfig) return false
    let bool = false
    for (let o of controlWrapConfig) {
      bool = this.haePro(o.config)
      if (bool) return true
    }
    return bool
  }

  async componentDidMount() {
    const { ruleWidget, revisionData, remoteUrl, themeId, isThemeRule } =
      this.props.rule

    // 来源于模板的规则项目并且不是模板的规则时，自动更新规则的版本和模板一致
    if (themeId && !isThemeRule) {
      let lastRule = await getThemeRuleVersion(themeId)
      this.setState({ lastRuleVersion: lastRule.version }, () => {
        if (
          this.state.lastRuleVersion &&
          this.state.lastRuleVersion != ruleWidget.version
        ) {
          Modal.info({
            title: '提示',
            content:
              '当前项目的配置已经自动更新为最新版，请填写相关配置，再次发布之后，线上数据立即生效呦～',
            okText: '确认'
          })
        }
      })
    }

    try {
      let version = this.state.lastRuleVersion || ruleWidget.version
      let ruleDefine = await loadTriggerConfig({
        // 规则组件名字.
        type: ruleWidget.type,
        version: version
      })
      console.log(
        '🚀 ~ file: App.js ~ line 595 ~ App ~ componentDidMount ~ ruleDefine',
        ruleDefine
      )
      const currentData = ruleDefine.data

      if (revisionData) {
        Object.keys(currentData).forEach((prop) => {
          currentData[prop] =
            revisionData[prop] !== undefined
              ? revisionData[prop]
              : currentData[prop]
        })
      }

      let previewUrl = handerRuleUrl(remoteUrl, this.props.rule._id, 'gray')

      this.setState({
        remoteUrl: previewUrl,
        ruleConfig: ruleDefine,
        ruleComponent: new Rule(ruleDefine)
      })

      await this.getRuleData()
    } catch (error) {
      console.log('error', error)
    }
  }

  render() {
    const { remoteUrl, hasError, ruleComponent, showPublishModal, showPro } =
      this.state
    const { controlWrapConfig, navConfig } = this.state.ruleComponent
      ? this.handleRuleConfig(this.state.ruleComponent.config)
      : ''
    const hasPro = this.judgePro(controlWrapConfig)
    const { rule } = this.props

    return (
      <div className="rule-config">
        <div className="rule-config__head">
          <HENavbar
            actionElement={
              <>
                {remoteUrl && (
                  <Tooltip
                    placement={'bottomLeft'}
                    title={
                      '预览时，测试环境的数据会变动，若已提测，尽量不进行多次预览'
                    }
                  >
                    <HEIconButton
                      className="editor-navbar__actions__icon-button"
                      iconElement={<Preview />}
                      titleElement={'预览'}
                      onClick={this.onPreview.bind(this)}
                    />
                  </Tooltip>
                )}

                {/* 保存按钮. */}
                <HEIconButton
                  className="editor-navbar__actions__icon-button"
                  iconElement={<Save />}
                  titleElement={'保存'}
                  onClick={this.onSaveRule.bind(this, 'update', null, null)}
                />

                {/* 项目链接和项目发布. */}
                {remoteUrl && (
                  <React.Fragment>
                    <HEIconButton
                      className="editor-navbar__actions__icon-button"
                      iconElement={<Link />}
                      titleElement={'项目链接'}
                      onClick={this.getProjectUrl.bind(this, rule, false, true)}
                    />
                    <HEIconButton
                      className="editor-navbar__actions__icon-button"
                      iconElement={<Send />}
                      titleElement={'发布'}
                      onClick={() => this.setState({ showPublishModal: true })}
                    />
                  </React.Fragment>
                )}

                {/* 进入编辑. */}
                {!remoteUrl && (
                  <HEButton
                    className="rule-config__next__btn"
                    onClick={this.handleEidtorTheme.bind(this, false, 'update')}
                  >
                    {'进入编辑'}
                  </HEButton>
                )}
              </>
            }
          >
            <p className="h5-navbar-title">规则配置-{rule.name}</p>
          </HENavbar>
        </div>
        <div className="rule-config__container">
          {ruleComponent ? (
            <React.Fragment>
              {navConfig && navConfig.length > 0 && (
                <RuleNavbar config={navConfig} ruleComponent={ruleComponent}>
                  {' '}
                </RuleNavbar>
              )}
              <div className="rule-config__body">
                <div
                  className="rule-config__content"
                  style={{
                    margin:
                      !remoteUrl && (!navConfig || navConfig.length <= 0)
                        ? '0 auto'
                        : ''
                  }}
                >
                  {validateRoleLimit('createRuleProject') && (
                    <div className="rule-config__content--box">
                      <span>当前规则的组件版本：</span>
                      <UpdateWidgetVersion
                        updateAfterCallback={this.updateRuleVersion.bind(this)}
                        installedVersion={ruleComponent.version}
                        key={ruleComponent.type}
                        WidgetConfig={{
                          ...ruleComponent,
                          category: 'rule'
                        }}
                      />
                    </div>
                  )}
                  {!hasError ? (
                    <>
                      {controlWrapConfig.map((item, index) => {
                        return (
                          <div
                            className={
                              (item.title
                                ? `groupControlWrap groupControlWrap-${index}`
                                : '') + ' controlWrap'
                            }
                            key={`${rule._id}_${ruleComponent.version}${index}`}
                          >
                            {item.title && (
                              <div className="controlWrap-title">
                                {item.title}
                              </div>
                            )}
                            <div
                              className={item.title ? 'controlWrap-item' : ''}
                            >
                              <ControlWrap
                                showPro={showPro}
                                WidgetConfig={item.config}
                                project={ruleComponent}
                                element={ruleComponent}
                                namespace={'data'}
                                ref={(node) =>
                                  (this['controlWrapRef' + index] = node)
                                }
                              />
                            </div>
                          </div>
                        )
                      })}
                      {hasPro && (
                        <div style={{ margin: '25px 0' }}>
                          <span
                            style={{
                              marginRight: '5px',
                              verticalAlign: 'middle'
                            }}
                          >
                            高级配置
                          </span>
                          <Switch onChange={this.onChangePro} />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="widget-error">当前组件异常</div>
                  )}
                </div>
              </div>
            </React.Fragment>
          ) : null}
          {remoteUrl && (
            <div className="rule-config__preview">
              <iframe
                width="375"
                className="rule-config__preview--iframe"
                src={remoteUrl}
                style={
                  navConfig && navConfig.length == 0
                    ? { height: '603px', top: '45%' }
                    : {}
                }
              />
            </div>
          )}
        </div>
        {showPublishModal && (
          <ConfirmPublishModal
            onClose={() => this.setState({ showPublishModal: false })}
            publishOnlineTest={this.handlePublishOnlineTest}
            publishOnline={this.handlePublishOnline}
          />
        )}
      </div>
    )
  }
}

export default App
