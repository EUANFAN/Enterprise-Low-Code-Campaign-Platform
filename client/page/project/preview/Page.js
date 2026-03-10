/*
 * @Description:
 * @Version: 2.0
 * @Autor: zhangyan
 * @Date: 2020-09-02 20:16:17
 * @LastEditors: zhangyan
 * @LastEditTime: 2021-05-14 15:16:13
 */
import { observer } from 'mobx-react'
import Container from 'common/Container'
import { runTriggers, ssrRender } from 'common/utils'
import WidgetClass from './Widget'
import { connectToStore } from 'components/StoreContext'
import { handlePageDataByVariableStore } from 'common/handlePageDataByVariable'
import { useDataValue } from 'utils/ModelUtils'
import './Page.less'
@observer
class Page extends Container {
  // 会继承Container的dom结构，去看common/Container的结构
  constructor(props) {
    super(props)
    // TODO：check or modify 在此处声明 WidgetClass 然后在 Container里边调用？
    this.WidgetClass = WidgetClass
    this.state = {
      isLoaded: false
    }
  }
  async UNSAFE_componentWillMount() {
    let { project, container } = this.props
    // ssr的时候，碰到 await 会直接跳过，去走render， setState后不会重新render
    if (!ssrRender(project, container)) {
      await handlePageDataByVariableStore(project, container)
    }
    this.setState({
      isLoaded: true
    })

    if (god.inPreview) {
      this.runTriggers('willmount')
    }

    let scrollTrigger =
      this.props.container.triggers &&
      this.props.container.triggers.filter(
        (trigger) => trigger.event == 'scroll'
      )
    if (scrollTrigger && scrollTrigger.length) {
      document.addEventListener('scroll', () => {
        let scrollTop =
          document.documentElement.scrollTop || document.body.scrollTop
        this.onScroll(scrollTop, scrollTrigger[0].distance)
      })
    }
    let title = '希望学'
    if (container['pageTitle']) {
      title = useDataValue(
        container.pageTitle,
        container.variableStore,
        container,
        project
      )
    } else {
      title = useDataValue(
        project.title,
        project.pages[0].variableStore,
        project.pages[0],
        project
      )
    }
    document.title = title
  }
  render() {
    if (!this.state.isLoaded) return null
    return super.render()
  }
  componentDidMount() {
    if (god.inPreview) {
      this.onEnter()
    }
  }
  componentWillUnmount() {
    if (god.inPreview) {
      this.onLeave()
    }
  }
  onWillMount = () => {
    this.runTriggers('willmount')
  }
  onBack = () => {
    this.runTriggers('back')
  }
  onEnter = () => {
    this.runTriggers('enter')
  }

  onLeave = () => {
    this.runTriggers('leave')
  }
  runTriggers = (state) => {
    runTriggers(
      this.props.container.triggers,
      state,
      'page',
      {},
      this.props.container
    )
  }
}

export default connectToStore(Page)
