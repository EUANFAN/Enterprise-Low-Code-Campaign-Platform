import React from 'react'
import { observer } from 'mobx-react'
import arrayMove from 'array-move'
import { connectToStore } from 'components/StoreContext'
import EditorLeftTab from '../components/EditorLeftTab'
import { getThemesByThemeGroup } from 'apis/ThemeAPI'
const EMPTY_LIST = new Array(5).fill(null)

const getStageType = (type) => {
  switch (type) {
    case 'project':
      return 'page'
    case 'widget':
      return 'layer'
    default:
      return null
  }
}

@observer
class EditorLeftTabContainer extends React.Component {
  state = { templates: EMPTY_LIST, getTemplate: true }

  async UNSAFE_componentWillMount() {
    const { store } = this.props
    const { themeGroupId } = store.getProject()
    if (themeGroupId) {
      await new Promise((resolve) => {
        getThemesByThemeGroup(themeGroupId, 0, 50, true).then(({ list }) => {
          this.setState({
            templates: list.filter((template) => template.revisionData)
          })
          resolve(true)
        })
      })
    }
  }

  _setPage = (item, type, parentStage) => {
    const { store } = this.props
    parentStage.selectChildren([item.id])
    store.getStageStore().clearCurrentStage()
    store.getStageStore().setCurrentStage(item, type)
  }

  _handlePageSelect = (id) => {
    const { store } = this.props
    let parentStage = store.getStageStore().getParentStage()
    let item = parentStage.list.find((page) => page.id === id)
    let type = getStageType(parentStage.type)
    this._setPage(item, type, parentStage)
  }

  _handleDeletePage = (event, id) => {
    event.stopPropagation()
    const { store } = this.props
    let parentStage = store.getStageStore().getParentStage()
    parentStage.removeChild(id)
    let list = parentStage.list
    let index = list.map((item) => item.id).indexOf(id)
    let next = list[Math.max(index - 1, 0)]
    let type = getStageType(parentStage.type)
    this._setPage(next, type, parentStage)
  }

  _handleCreatePage = () => {
    const { store } = this.props
    let parentStage = store.getStageStore().getParentStage()
    let item = parentStage.addChild()
    let type = getStageType(parentStage.type)

    this._setPage(item, type, parentStage)
  }
  _handleTemplateSelect = (themeId) => {
    const { store } = this.props
    const project = store.getProject()
    const selectedTheme = this.state.templates.find(
      (theme) => theme && theme._id === themeId
    )
    store.init({
      ...selectedTheme.revisionData,
      themeId: themeId,
      themeGroupId: selectedTheme.themeGroupId,
      editable: selectedTheme.editable,
      _id: project._id,
      origin: selectedTheme.origin || '',
      thirdPartyConfig: selectedTheme.thirdPartyConfig || '',
      editorType: 'project',
      rulesConfig: project.rulesConfig
    })
  }
  _sortPage = ({ oldIndex, newIndex }) => {
    const { store } = this.props
    let parentStage = store.getStageStore().getParentStage()
    let listId = parentStage.list.map((item) => item.id)
    let order = arrayMove(listId, oldIndex, newIndex)
    parentStage.sortChildren(order)
  }

  // NOTE: 因为 currentStage 不一定含 pages 这里主动检查到最近的父级
  _getClosestLayer() {
    const { store } = this.props
    const stageStore = store.getStageStore()
    let stage = stageStore.getCurrentStage()
    return stage.type === 'widget' || stage.type === 'project'
      ? stage
      : stageStore.getParentStage()
  }
  render() {
    const { store, ...restProps } = this.props
    const { templates } = this.state
    const parentStage = this._getClosestLayer()
    let stage = store.getStageStore().getParentStage()
    let maxLayerCount = stage ? stage.component.maxLayerCount : 1
    const project = store.getProject()
    const selectedPage = parentStage.list.find((page) => page.isSelected)

    return (
      <>
        <EditorLeftTab
          store={store}
          {...restProps}
          maxLayerCount={maxLayerCount}
          showTemplates={Boolean(project.themeGroupId)}
          pages={[...parentStage.list]}
          templates={templates}
          project={project}
          currentPageId={selectedPage.id}
          onSelectPage={this._handlePageSelect}
          onDeletePage={this._handleDeletePage}
          onCreatePage={this._handleCreatePage}
          onSelectTemplate={this._handleTemplateSelect}
          onSortPage={this._sortPage}
        />
      </>
    )
  }
}

export default connectToStore(EditorLeftTabContainer)
