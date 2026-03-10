import React from 'react'
import { observer } from 'mobx-react'
import { Tabs, Tooltip } from 'antd'
import HEOperationList from 'components/HEOperationList'
import AttributePanel from '../HEAttributePanel' // 配置
import LayerList from '../HELayerList' // 图层
import SubList from '../HESubList' // 动画&&行为
import ConditionPanel from '../HEConditionPanel'
import './index.less'
import { connectToStore } from 'components/StoreContext'
import { validateRoleLimit } from 'common/utils'
const TabPane = Tabs.TabPane

/**
 *
 * ## SettingPanel Tab item 显示逻辑
 *
 * 1. 页面
 *  配置(项目配置、页面配置)、行为、图层、条件（仅限使用业内变量时）
 *
 * 2. 单组件
 *  配置、行为、动画、图层
 *
 * 3. 多选组件
 * 只有 图层
 *
 * 4. layer
 * 只有 配置、图层
 * 页面有加载完成的行为，但layer没有
 * 其实 配置在外部也可以配置，且有更多的选项，为什么保留两者，两者是否有必要读取同一份配置数据
 *
 * ### 配置
 * 1. 找到当前的 stage (layer or page)
 * 2. 找到当前选择的元素
 * 3. 通过 AttributePanel 加载当前 page/widget 的各个 Control
 * 4. 如果 Control 发生更改，通过 props 中传递过去的 当前元素的 modify 方法，
 * 更改全局 store 中该元素的属性值
 *
 * ### 行为、动画
 * 1. 行为和动画都是同一种 dom 结构及交互
 * 2. 通过 props 中传递的 element 已经包含了 addAnimation、removeAnimtion 等方法
 * 3. 已有动画或行为也在传递进去的 数据中，直接渲染即可
 *
 * ### 图层
 * 1. 计算 current stage 中 normal、flow widgets list
 * 2. 通过 react-drag-sortable 封装变成可拖拽移动位置的组件
 *
 * ### 条件
 * 1. 仅 type===page && project.useData 显示
 */

@observer
class SettingsPanel extends React.Component {
  getPanleSetting(project, element, type) {
    let { config } = this.props
    let tabPanels = []
    let panelType = type.toUpperCase()
    // prettier-ignore
    let SETTINGS = config['SETTINGS'][panelType] ? config['SETTINGS'][panelType] : {}

    Object.keys(SETTINGS).forEach((key) => {
      if (SETTINGS[key] === true) {
        switch (key) {
          case 'ATTRIBUTE': {
            const attributeList = SETTINGS['ATTRIBUTELIST']
            tabPanels.push(
              <TabPane tab={'配置'} key="attribute">
                <AttributePanel
                  element={element}
                  project={project}
                  type={type}
                  attributeList={attributeList}
                />
              </TabPane>
            )
            break
          }
          case 'TRIGGERS':
            validateRoleLimit('editorTriggerPanel') &&
              tabPanels.push(
                <TabPane
                  tab={
                    <Tooltip
                      placement="bottom"
                      title={'项目加载后的行为，如发送PV日志、分享配置'}
                    >
                      {'行为'}
                    </Tooltip>
                  }
                  key="triggers"
                  className="trigger-panel"
                >
                  <SubList
                    project={project}
                    element={element}
                    key={element.id}
                    namespace="triggers"
                    type={type}
                  />
                </TabPane>
              )
            break
          case 'LAYER':
            validateRoleLimit('editorLayerPanel') &&
              tabPanels.push(
                <TabPane tab={'图层'} key="layer">
                  <LayerList />
                </TabPane>
              )
            break
          case 'ANIMATIONS':
            validateRoleLimit('editorAnimationPanel') &&
              tabPanels.push(
                <TabPane tab={'动画'} key="animations">
                  <SubList
                    project={project}
                    element={element}
                    namespace="animations"
                    type={type}
                  />
                </TabPane>
              )
            break
          default:
            break
        }
      }
    })
    // prettier-ignore
    if (project.showDisplay && type == 'widget' && validateRoleLimit('editorConditionPanel')) {
      tabPanels.push(
        <TabPane tab={'显示条件'} key="condition">
          <ConditionPanel
            project={project}
            element={element}
            namespace="condition"
            type={type}
          />
        </TabPane>
      )
    }
    return tabPanels
  }
  handleTab(value) {
    let { store } = this.props
    let stageStore = store.getStageStore()
    stageStore.setActiveTab(value)
  }
  render() {
    let { store } = this.props
    let stageStore = store.getStageStore()
    let project = stageStore.getProject()
    let stage = stageStore.getCurrentStage()
    const { activeTab } = stageStore
    let widgets = []
    if (stage.type == 'page' || stage.type == 'layer') {
      widgets = stage.getSelectedChildren()
    }
    let type = stage.type
    let element

    let defaultTab = 'attribute'
    // 以下判断的顺序不能改！！！
    // 组件单选
    if (widgets.length == 1) {
      type = 'widget'
      element = widgets[0]
    }
    // 组件多选
    else if (widgets.length > 1) {
      type = 'multiWidgets'
      element = stage.component
    } else {
      element = stage.component
    }
    const panel = this.getPanleSetting(project, element, type)

    return (
      <div className="settings-panel">
        <HEOperationList project={project} />
        {panel.length ? (
          <Tabs
            defaultActiveKey={defaultTab}
            activeKey={activeTab}
            onChange={this.handleTab.bind(this)}
            type="top"
            size="small"
          >
            {panel}
          </Tabs>
        ) : (
          <div className="multi-select-panel">多选操作中</div>
        )}
      </div>
    )
  }
}

export default connectToStore(SettingsPanel)
