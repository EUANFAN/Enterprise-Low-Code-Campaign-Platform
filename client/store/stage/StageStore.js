import { observable, reaction } from 'mobx'
import Stage from './Stage'
import Project from '../clazz/Project'
import history from 'common/record'
import { getProjectComponentTypes } from 'common/component'

const EXPERIMENT_FLAG_LOCALSTORAGE_KEY = 'h5:experimentFlag'
const PROFESSIONAL_FLAG_LOCALSTORAGE_KEY = 'h5:professionalFlag'

/**
 * 控制舞台展示的类，比如：
 * 1. 操作区域，
 * 2. 编辑区域，
 * 3. 设置区域
 */
class StageStore {
  // 当前项目
  @observable project = null
  // 是否为专业版
  @observable isProfessional =
    localStorage.getItem(PROFESSIONAL_FLAG_LOCALSTORAGE_KEY) === '1'
  // 当前舞台类型
  @observable componentPlat = 'h5'
  // 当前组件栈
  @observable stages = []
  // 当前舞台已安装的组件
  @observable installedComponents = {}
  // 舞台切换索引，主页面0，其它页面1
  @observable swiperIndex = 0
  @observable experimentFlag =
    localStorage.getItem(EXPERIMENT_FLAG_LOCALSTORAGE_KEY) === '1'
  @observable richTextEditorTargetId = null
  @observable closeHotKeys = false
  @observable activeTab = 'attribute'

  constructor(data) {
    this.project = observable(new Project(data.project))
    data.project.componentPlat &&
      (this.componentPlat = data.project.componentPlat)
    const installed = god.PageData.installed
    for (var key in installed) {
      this.installedComponents[key] = installed[key]
    }
    this.installedComponents = observable(this.installedComponents)
    if (data.stages) {
      this.stages = observable(data.stages || [])
    }
    this.swiperIndex = data.swiperIndex || 0
  }

  /**
   * 设置当前的Stage
   * @param {Project|Page|Widget|Layer} component 组件
   * @param {string}                    type      组件类型
   */
  setCurrentStage(component, type) {
    this.stages.push({ componentId: component.id, type })
    // 例如双击一个容器时，会调用两次，第二次调用时才会触发 swiperIndex 更改
    this.swiperIndex = Math.ceil(this.stages.length / 2) - 1
    if (this.stages.length % 2 === 0) {
      history.record()
    }
  }
  setCurrentStageByPath(path, type) {
    const stages = this.stages
    for (var i = 1; i < path.length; i++) {
      if (path[i].componentId !== stages[i]?.componentId) break
    }
    this.getCurrentStage().unselectChildren()
    const newpath = path.slice(i)
    const currentStage = newpath[newpath.length - 1]
    this.stages.splice(i, stages.length - i, ...newpath.slice(0, -1))
    if (type === 'layer' || type === 'page') {
      this.getCurrentStage().selectChildren(currentStage?.componentId)
    }
    if (currentStage) {
      this.stages.push(currentStage)
    }
    this.swiperIndex = Math.ceil(this.stages.length / 2) - 1
    history.record()
  }
  changeMoveStage(parentId, sourceId, targetId) {
    const stage = new Stage(this.getComponentById(parentId), 'widget')
    stage.changeMovePosition(sourceId, targetId)
  }
  /**
   * 获取当前的Stage
   * @return {Stage} 舞台数据
   */
  getCurrentStage() {
    // this.stages在edit/main中会被初始化一个project当做当前舞台数据
    const stage = this.stages[this.stages.length - 1]
    return new Stage(this.getComponentById(stage.componentId), stage.type)
  }
  getCurrentPage() {
    return this.getAllStages()[1]
  }
  getCurrentProject() {
    return this.getAllStages()[0]
  }
  getUsedComponents() {
    // 存在当前page内有A组件，page内某个容器内还存在A组件，这两个组件的版本要保持一致
    let usedComponents = {}
    const currentProject = this.getCurrentProject()
    Object.assign(
      usedComponents,
      getProjectComponentTypes(currentProject.component)
    )
    return usedComponents
  }
  getInstalledComponents() {
    return this.installedComponents
  }
  async updateInstallComponents(widget, setUp) {
    let obj = {}
    obj[widget.type] = Object.assign(JSON.parse(JSON.stringify(widget)), {
      version: widget.version
    })
    if (setUp) {
      Object.assign(this.installedComponents, obj)
      return
    }
    delete this.installedComponents[widget.type]
  }
  /**
   * 获取父级的Stage
   *
   * @return {Stage} 舞台数据
   */
  getParentStage() {
    const stage = this.stages[this.stages.length - 2]
    return new Stage(this.getComponentById(stage.componentId), stage.type)
  }
  getAllStages() {
    return this.stages.map(
      (stage) => new Stage(this.getComponentById(stage.componentId), stage.type)
    )
  }

  clearCurrentStage() {
    this.stages.pop()
  }

  clearChildrenStage() {
    const currentIndex = this.swiperIndex * 2 + 1
    this.stages.splice(currentIndex + 1, this.stages.length - currentIndex - 1)
  }

  redirectStage(targetStage) {
    let targetIndex = 0
    this.stages.forEach(function (stage, index) {
      if (targetStage.component.id === stage.componentId) {
        targetIndex = index
      }
    })
    targetIndex += 1
    this.swiperIndex = targetIndex / 2 - 1
  }

  getProject() {
    return this.project
  }
  getComponentById(id, container) {
    if (!id) {
      return this.project
    }
    container = container || this.project
    const children =
      container.pages || container.widgets || container.layers || []
    let result
    if (container.id == id) {
      result = container
    } else {
      children.forEach((child) => {
        if (!result) {
          result = this.getComponentById(id, child)
        }
      })
    }
    return result
  }

  toggleExperimentFlag() {
    this.experimentFlag = !this.experimentFlag
    localStorage.setItem(
      EXPERIMENT_FLAG_LOCALSTORAGE_KEY,
      this.experimentFlag ? '1' : '0'
    )
  }

  toggleProfessionalFlag(checked) {
    this.isProfessional = checked
    localStorage.setItem(
      PROFESSIONAL_FLAG_LOCALSTORAGE_KEY,
      this.isProfessional ? '1' : '0'
    )
  }

  setRichTextEditorTargetId(widgetId) {
    this.richTextEditorTargetId = widgetId
    reaction(
      () => this.getComponentById(widgetId).isSelected,
      (selected) => {
        if (!selected) this.richTextEditorTargetId = null
      }
    )
  }
  toggleComponentPlatFlag(componentPlat) {
    this.componentPlat = componentPlat
  }
  setActiveTab(value) {
    this.activeTab = value
  }
}

export default StageStore
