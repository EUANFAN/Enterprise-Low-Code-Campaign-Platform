import { observable } from 'mobx'
import StageStore from './StageStore'
import history from 'common/record'

let data = observable.map({ stageStore: null })

let store = {
  init(projectData, pageIndex = 1) {
    let stageStore = new StageStore({ project: projectData })
    let project = stageStore.project

    stageStore.setCurrentStage(project, 'project')

    let selectedPage = project.pages[pageIndex - 1]

    project.pages.forEach((page, index) => {
      if (pageIndex - 1 == index) {
        page.isSelected = true
        selectedPage = page
      } else {
        page.isSelected = false
      }
    })

    stageStore.setCurrentStage(selectedPage, 'page')
    data.set('stageStore', stageStore)
    // TODO 这里使用new过的stageStore再去new了一次
    // 待确定这步操作的意义，再做修改
    history.register(store)
  },
  setStageStore(stageStore) {
    data.set('stageStore', new StageStore(stageStore))
  },
  getProject() {
    return data.get('stageStore') && data.get('stageStore').getProject()
  },
  getStageStore() {
    return data.get('stageStore')
  },
  setPageData(key, value) {
    const project = data.get('stageStore').getProject()
    project.setPageData(key, value)
  },
  getPageDataByKey(key) {
    return data.get('stageStore').getProject().getPageDataByKey(key)
  }
}

export default store
