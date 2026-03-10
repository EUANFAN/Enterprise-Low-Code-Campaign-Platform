import React from 'react'
import { observer } from 'mobx-react'
import uid from 'uid'
import { debounce } from 'lodash'
import { Card, Tooltip, Icon } from 'antd'
import InfiniteScroll from 'react-infinite-scroll-component'
import HETagPanel from 'components/HETagPanel'
import HEComponentInfoPreview from 'components/HEComponentInfoPreview'
import { getWidgetList } from 'apis/WidgetAPI'
import SearchWidget from './SearchWidget'
import store from 'store/stage'
import { insertWidget } from 'common/widget'
import { getTagList } from 'apis/TagAPI'
import { validateRoleLimit, getWidgetRole } from 'common/utils'

import './index.less'

@observer
class HEEditorLeftWidgetPanel extends React.Component {
  pageSize = 20
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      currentPage: 0,
      keywords: '',
      hasMore: true,
      infiniteScrollKey: uid(10),
      prevPlatform: 'h5',
      tagList: [],
      selectedTags: [],
      tagType: 'all',
      descUrl: '',
      isShowComponentInfoPreview: false,
      showTagTitle: false,
      selectedType: 'all'
    }
  }
  async loadComponentsList() {
    let { list } = this.state
    const currentPage = this.state.currentPage + 1
    const components = await this.getComponentList(currentPage)
    list = list.concat(components.widgets)
    this.setState({
      list,
      currentPage: currentPage,
      hasMore: components.widgets.length === this.pageSize
    })
  }
  // 获取当前页面内使用的组件
  getUsedComponents() {
    let stageStore = store.getStageStore()
    return stageStore.getUsedComponents() || {}
  }
  getStoreComponentPlat() {
    const stageStore = store.getStageStore()
    return stageStore.componentPlat
  }
  initRole() {
    const { showTagTitle, selectedType } = getWidgetRole('UIWidget')
    this.setState({ showTagTitle, selectedType }, () => {
      selectedType != 'all' &&
        selectedType != 'no' &&
        this.getWidgetByTagType(selectedType)
    })
  }
  async UNSAFE_componentWillMount() {
    this.initRole()
    const { list } = await getTagList()
    await this.loadComponentsList()
    this.setState({
      tagList: list,
      prevPlatform: this.getStoreComponentPlat()
    })
  }
  async getComponentList(currentPage = 1) {
    const { userInfo } = god.PageData
    // prettier-ignore
    const userDeptId = validateRoleLimit('chooseBizUnit') ? '' : userInfo.userDeptId
    const { keywords, selectedTags, tagType } = this.state
    const componentPlat = this.getStoreComponentPlat()

    return getWidgetList({
      q: keywords,
      current: currentPage,
      pageSize: this.pageSize,
      userDeptId,
      type: 'widget',
      componentPlat: componentPlat,
      selectedTags,
      tagType
    })
  }
  async filterComponentsList() {
    const { widgets } = await this.getComponentList(1)
    this.setState({ list: [...widgets] })
  }
  async _onSearchWidget(keywords) {
    this.InfiniteScrollParentNode.scrollTo(0, 0)
    // 当list为空，hasMore为true时， 会自动触发 InfiniteScroll 组件的 loadMore 方法
    this.setState({ keywords: keywords }, async () => {
      await this.filterComponentsList()
    })
  }
  onChangeSearch = (e) => {
    this.setState({ keywords: e.target.value })
  }
  _handleIconClick = (widget, e) => {
    e.stopPropagation()
    this.setState({
      isShowComponentInfoPreview: widget.descUrl && true,
      descUrl: widget.descUrl
    })
  }
  isChangePlatform() {
    const componentPlat = this.getStoreComponentPlat()
    const { prevPlatform } = this.state
    return prevPlatform !== componentPlat
  }

  getStageWidgetList() {
    const usedComponents = this.getUsedComponents()
    const componentNameStyle = { padding: '0px', height: '38px' }
    return this.state.list.map((widget) => {
      const insertWidgetInfo = {
        type: widget.type,
        version: usedComponents[widget.type] || widget.version
      }
      return (
        widget && (
          <Card
            key={widget._id}
            hoverable
            // prettier-ignore
            onClick={debounce(() => insertWidget(null, insertWidgetInfo, true), 1000)}
            className="he-editor-left-widget-panel__list-item"
            bodyStyle={componentNameStyle}
            cover={
              <div className="he-editor-left-widget-panel__list-item__cover">
                <img
                  draggable="false"
                  className="he-editor-left-widget-panel__list-item__cover__img"
                  src={widget.widgetUrl}
                />
              </div>
            }
          >
            <div className="he-editor-left-widget-panel__list-item__body">
              <Tooltip
                placement="topLeft"
                title={widget.desc}
                arrowPointAtCenter
              >
                {widget.name}
                <Icon
                  onClick={this._handleIconClick.bind(this, widget)}
                  type="question-circle-o"
                  style={{ right: '6px', bottom: '13px', position: 'absolute' }}
                />
              </Tooltip>
            </div>
          </Card>
        )
      )
    })
  }
  getWidgetByTagType(type) {
    this.InfiniteScrollParentNode.scrollTo(0, 0)
    this.setState(
      {
        tagType: type,
        // 切换type时重置tag
        selectedTags: []
      },
      async () => {
        await this.filterComponentsList()
      }
    )
  }

  async getWidgetByTag(selectedTags) {
    this.InfiniteScrollParentNode.scrollTo(0, 0)
    this.setState({ selectedTags: selectedTags }, async () => {
      await this.filterComponentsList()
    })
  }

  render() {
    const {
      tagList,
      list,
      isShowComponentInfoPreview,
      descUrl,
      selectedType,
      showTagTitle
    } = this.state
    return (
      <div className="he-editor-left-widget-panel">
        <SearchWidget
          onSearchWidget={this._onSearchWidget.bind(this)}
          onChangeSearch={this.onChangeSearch}
        ></SearchWidget>
        <HETagPanel
          tagList={tagList}
          showTagTitle={showTagTitle}
          selectedType={selectedType}
          getWidgetByTag={this.getWidgetByTag.bind(this)}
          getWidgetByTagType={this.getWidgetByTagType.bind(this)}
        ></HETagPanel>
        {/* <ComponentPlatformSelect /> */}
        <div
          id="scrollableDiv"
          ref={(node) => {
            this.InfiniteScrollParentNode = node
          }}
          className="he-editor-left-widget-panel__content"
        >
          <InfiniteScroll
            className="he-editor-left-widget-panel__list"
            dataLength={list.length}
            next={this.loadComponentsList.bind(this)}
            hasMore={true}
            scrollableTarget="scrollableDiv"
          >
            {this.getStageWidgetList()}
          </InfiniteScroll>
        </div>
        <div className="componentPreview">
          {isShowComponentInfoPreview && (
            <HEComponentInfoPreview
              previewTargetUrl={descUrl}
              onClose={() => {
                this.setState({ isShowComponentInfoPreview: false })
              }}
            />
          )}
        </div>
      </div>
    )
  }
}
export default HEEditorLeftWidgetPanel
