import React from 'react'
import { observer } from 'mobx-react'
import { Row, Col, Collapse } from 'antd'
import store from 'store/stage'
import { loadWidgetConfig, getWidgetConfigByType } from 'widgets'
import ControlWrap from 'controls/ControlWrap'
import getControls from 'controls'
import base from 'base'
import { WidgetConfigs } from 'widgets'
import './index.less'
import { getModelConfig } from 'common/config'
import { connectToStore } from 'components/StoreContext'
import UpdateWidgetVersion from 'components/HEWidgetLibrary/UpdateWidgetVersion'
import { setProjectComponentVersion } from 'common/component'

const Panel = Collapse.Panel
const titles = {
  project: '项目配置',
  share: '分享配置',
  page: '页面配置',
  layer: '面板样式配置',
  widget: '组件样式配置'
}

@observer
class AttributePanel extends React.Component {
  state = {
    loaded: false,
    Controls: null
  }

  getControls = (type, element) => {
    let me = this
    let project = me.props.project
    let baseAttribute = base[type]
    let stageStore = store.getStageStore()
    const model = stageStore.isProfessional ? 'professional' : 'Normal'
    let panelType = type.toUpperCase()
    const { attributeList } = this.props
    let SETTINGS = []
    /* widget需要特殊处理，因为属性列表中又特殊和普通两项 */
    if (panelType == 'WIDGET') {
      // prettier-ignore
      SETTINGS = attributeList['NORMAL'] instanceof Array && attributeList['NORMAL'].length ? attributeList['NORMAL'] : Object.keys(baseAttribute)
    } else {
      // prettier-ignore
      SETTINGS = attributeList[panelType] instanceof Array && attributeList[panelType].length ? attributeList[panelType] : Object.keys(baseAttribute)
    }
    let configList = getModelConfig(SETTINGS, type, model)
    let elementConfig = {}
    configList.forEach((attribute) => {
      elementConfig[attribute] = baseAttribute[attribute]
    })
    return (
      <Panel header={titles[type]} key={type}>
        <ControlWrap
          key={`${element.id}_${model}`}
          WidgetConfig={elementConfig}
          project={project}
          element={element}
          ref={(node) => (this.controlWrapRef = node)}
        />
      </Panel>
    )
  }
  // 获取当前页面内使用的组件
  getUsedComponents() {
    let stageStore = store.getStageStore()
    return stageStore.getUsedComponents() || {}
  }
  updateAfterCallback(targetWidget) {
    const stageStore = store.getStageStore()
    let currentStage = stageStore.getCurrentProject()
    // 替换已使用的组件version
    setProjectComponentVersion(currentStage.component, targetWidget)
    stageStore.updateInstallComponents(targetWidget, true)
  }
  getConfigControls = (type, element) => {
    try {
      let me = this
      let project = me.props.project
      let widgetType = element.type
      let version = element.version
      const WidgetConfig = WidgetConfigs.find((config) => {
        return config.type == widgetType && config.version == version
      })
      const stageStore = store.getStageStore()
      let usedComponents = {}
      let installedVersion = ''
      if (stageStore.isProfessional) {
        usedComponents = this.getUsedComponents()
        installedVersion = usedComponents[WidgetConfig && WidgetConfig.type]
      }

      return (
        WidgetConfig && (
          <Panel header={WidgetConfig.name + '特性配置'} key="data">
            {WidgetConfig.config && (
              <ControlWrap
                key={element.id + version}
                WidgetConfig={WidgetConfig.config}
                project={project}
                element={element}
                namespace={'data'}
                ref={(node) => (this.controlWrapRef = node)}
              ></ControlWrap>
            )}
            {!WidgetConfig.isInner &&
              stageStore.isProfessional &&
              WidgetConfig.version && (
                <Row className="settings-panel__update-version">
                  <Col
                    span={6}
                    title={'组件版本'}
                    style={{
                      lineHeight: '32px',
                      color: '#333'
                    }}
                  >
                    组件版本
                  </Col>
                  <UpdateWidgetVersion
                    updateAfterCallback={this.updateAfterCallback.bind(this)}
                    installedVersion={installedVersion}
                    key={WidgetConfig.type}
                    WidgetConfig={WidgetConfig}
                  ></UpdateWidgetVersion>
                </Row>
              )}
          </Panel>
        )
      )
    } catch (error) {
      console.log('error', error)
    }
  }
  async UNSAFE_componentWillMount() {
    let { type, element } = this.props
    if (type == 'widget' && element.version) {
      let WidgetConfig = getWidgetConfigByType(element.type, element.version)
      if (!WidgetConfig || (WidgetConfig && !WidgetConfig.onRender)) {
        await loadWidgetConfig(element)
      }
    }
    let Controls = await getControls()
    this.setState({
      loaded: true,
      Controls: Controls
    })
  }
  render() {
    let me = this
    let { type, element, project, attributeList } = this.props
    let stageStore = store.getStageStore()
    let stage = stageStore.getCurrentStage()
    let panels = []
    let autoHeight

    if (!this.state.loaded || !this.state.Controls) return null

    if (type == 'page') {
      let panel = me.getControls('project', project)
      // 项目配置面板
      if (attributeList['PROJECT']) {
        panels.push(panel)
      }
      // 页面配置面板
      if (attributeList['PAGE']) {
        // prettier-ignore
        panels.push(me.getControls(type, stage.component, element['isFullPage'] == false && [autoHeight]))
      }
      // 分享配置面板
      // TODO：暂时关闭分享配置入口
      if (false && attributeList['SHARE']) {
        panels.push(me.getControls('share', project.shareConfig))
      }
    } else if (type == 'layer') {
      panels.push(
        me.getControls(
          type,
          stage.component,
          element['isFullPage'] == false && [autoHeight]
        )
      )
    } else if (type == 'widget') {
      // 工程编辑中如果状态为只读，返回提示
      if (element.readonly) {
        return (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#ffeb3b',
              color: '#4A82F7'
            }}
          >
            当前组件状态为只读
          </div>
        )
      } else {
        // 组件的特性配置
        if (attributeList['FEATURE']) {
          panels.push(me.getConfigControls('widget', element))
        }
        let pane = me.getControls('widget', element)
        // 组件的通用配置
        if (attributeList['NORMAL']) {
          panels.push(pane)
        }
      }
    }
    return (
      <Collapse defaultActiveKey={['project', 'page', 'widget', 'data']}>
        {panels}
      </Collapse>
    )
  }
}

export default connectToStore(AttributePanel)
