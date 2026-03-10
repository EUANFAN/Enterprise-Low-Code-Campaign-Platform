import React from 'react'
import classNames from 'classnames'
import { Modal } from 'antd'
import HELoadingString from 'components/HELoadingString'
import HEProjectPosterImage from 'components/HEProjectPoster/HEProjectPosterImage'
import EditorTree from '../EditorTree'
import HEPaper from 'components/HEPaper'
import { SortableContainer, SortableElement } from '@k9/react-sortable-hoc'
// 新建项目的组件暂时写在home/components里面，未来抽出更高的层级。
import CreatePage from '../../../components/CreatePage'
import { connectToStore } from 'components/StoreContext'

import Trashcan from 'components/icons/Trashcan'
import LocalStorage from 'common/localStorage'
import { xEditorStore, getWidgetRole } from 'common/utils'
import './index.less'

import Project from 'store/clazz/Project'
import Page from 'store/clazz/Page'
import EditorLeftTabContainer from '@/page/editor/components/EditorLeftContainer'

// 组件缩略图面板
import HEEditorLeftWidgetPanel from 'components/HEEditorLeftWidgetPanel'
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions
} from 'components/HEModal'
import HESkyLayer from 'components/HESkyLayer'
import HEButton from 'components/HEButton'
import { Icon } from 'antd'

const PanelListItemSize = {
  WIDTH: 195,
  HEIGHT: 314
}

const tabConfig = [
  {
    title: '页面',
    icon: <Icon type="project" />,
    show: true
  },
  {
    title: '组件',
    icon: <Icon type="layout" />,
    show: true
  },
  {
    title: '图层',
    icon: <Icon type="switcher" />,
    show: true
  }
]

const PanelListItem = (props) => {
  const {
    selected,
    onSelect,
    loading,
    titleElement,
    customStore,
    project,
    page
  } = props
  let className = classNames(['editor-left-tab__poster-list__item'], {
    'editor-left-tab__poster-list__item--selected': selected,
    'editor-left-tab__poster-list__item--loading': loading
  })

  return (
    <div className={className} onClick={onSelect}>
      {!loading && (
        <HEProjectPosterImage
          width={PanelListItemSize.WIDTH}
          height={PanelListItemSize.HEIGHT}
          project={project}
          page={page}
          customStore={customStore}
        />
      )}
      <div className="editor-left-tab__poster-list__item__footer">
        {loading ? (
          <div className="editor-left-tab__poster-list__item__footer__loading">
            <HELoadingString />
          </div>
        ) : (
          titleElement
        )}
      </div>
    </div>
  )
}

class EditorLeftTab extends React.Component {
  state = {
    currentTab: '',
    showThemeModal: false,
    themeId: '', // 选择模板ID
    tabConfig
  }

  _handleShowTheme = () => {
    this.setState({
      showThemeModal: true,
      themeId: ''
    })
  }
  _handleCloseThme = () => {
    this.setState({
      showThemeModal: false
    })
  }

  _handleSelectTheme = (themeId) => {
    this.setState({
      themeId: themeId
    })
  }

  _handleUseTheme = () => {
    const { onSelectTemplate } = this.props
    const { themeId } = this.state
    const me = this
    Modal.confirm({
      title: '提示',
      content: '您选中的模板会覆盖当前项目的所有内容，确认继续?',
      okText: '确认',
      cancelText: '取消',
      zIndex: 99999,
      onOk() {
        if (themeId) {
          me.setState({
            showThemeModal: false
          })
          onSelectTemplate(themeId)
        }
      }
    })
  }

  _renderPages = () => {
    const {
      pages,
      onSelectPage,
      currentPageId,
      onCreatePage,
      onDeletePage,
      onSortPage,
      maxLayerCount,
      project,
      config,
      showTemplates
    } = this.props
    xEditorStore.currentPageId = currentPageId // 第一个页面不显示回退行为
    const canDelete = pages.length > 1
    let SHOW_TEMPLATE = config['EDITOR_PAGE_LIST']['SHOW_TEMPLATE']
    let ADD_PAGE = config['EDITOR_PAGE_LIST']['ADD_PAGE']

    const SortablePageItem = SortableElement(({ item }) => {
      let { page, index } = item
      return (
        <PanelListItem
          key={page.id}
          selected={currentPageId === page.id}
          itemId={page.id}
          page={page}
          customStore={false}
          project={project}
          onSelect={() => onSelectPage(page.id)}
          titleElement={
            <React.Fragment>
              <span
                className={
                  'editor-left-tab__poster-list__item__footer__title ' +
                  'editor-left-tab__poster-list__item__footer__title--left-align'
                }
              >
                {index + 1}
              </span>
              {canDelete && (
                <Trashcan
                  onClick={(event) => onDeletePage(event, page.id)}
                  className="editor-left-tab__poster-list__item__footer__icon"
                />
              )}
            </React.Fragment>
          }
        />
      )
    })

    const SortablePageList = SortableContainer(({ items }) => {
      return (
        <ul>
          {items
            .map((item, index) => (
              <SortablePageItem
                lockToContainerEdges={true}
                key={`item-${item.id}`}
                index={index}
                item={{ page: item, index }}
              />
            ))
            .concat([
              (maxLayerCount === undefined || maxLayerCount > pages.length) &&
              ADD_PAGE ? (
                <div
                  className="no-drag editor-left-tab__poster-list__item"
                  onClick={onCreatePage}
                  key={maxLayerCount + 1}
                >
                  <CreatePage title={'新建页面'} />
                </div>
              ) : null
            ])}
        </ul>
      )
    })

    return (
      <div className="editor-left-tab__poster-list">
        {showTemplates && SHOW_TEMPLATE ? (
          <div className="editor-left-tab__poster-list__template">
            <div
              className="editor-left-tab__poster-list__template__btn"
              onClick={this._handleShowTheme.bind(this)}
            >
              模板选择
            </div>
          </div>
        ) : null}
        <SortablePageList
          items={pages}
          onSortEnd={onSortPage}
          distance={10}
        ></SortablePageList>
      </div>
    )
  }

  _renderTemplates = () => {
    const { templates } = this.props
    const { themeId } = this.state
    return (
      <div className="editor-left-tab__templete-list">
        {templates.map((item, index) => {
          const template = item ? new Project(item.revisionData) : null
          const page = item ? new Page(item.revisionData.pages[0]) : null
          return template ? (
            <PanelListItem
              key={item._id || index}
              loading={!item}
              itemId={template._id}
              project={template}
              page={page}
              selected={item._id == themeId}
              customStore={false}
              onSelect={() => this._handleSelectTheme(item._id)}
              titleElement={
                <span className="editor-left-tab__poster-list__item__footer__title">
                  {item.name}
                </span>
              }
            />
          ) : null
        })}
      </div>
    )
  }

  async UNSAFE_componentWillMount() {
    const { config } = this.props
    const { tabConfig } = this.state
    const { EDITOR_WIDGET_LIST } = config
    const showWidget =
      getWidgetRole('UIWidget').selectedType != 'no' &&
      EDITOR_WIDGET_LIST['SHOW_LIST']
    const storageTab = await LocalStorage.getItem('h5:currentTab')
    if (storageTab !== null) {
      this.setState({
        currentTab: storageTab
      })
    } else if (showWidget) {
      this.setState({
        currentTab: '组件'
      })
    } else {
      this.setState({
        currentTab: '图层'
      })
    }
    if (!showWidget) {
      tabConfig[1].show = false
      this.setState({ tabConfig })
    }
  }
  handleTabChange = (currentTab) => {
    this.setState({ currentTab })
    LocalStorage.setItem('h5:currentTab', currentTab)
  }
  render() {
    const { store } = this.props
    const { showThemeModal, currentTab, tabConfig } = this.state

    return (
      <HEPaper>
        <EditorLeftTabContainer
          onChange={this.handleTabChange}
          tabConfig={tabConfig}
          currentTab={currentTab}
        >
          {currentTab === '页面' && this._renderPages()}
          {currentTab === '组件' && <HEEditorLeftWidgetPanel />}
          {currentTab === '图层' && <EditorTree store={store} />}
        </EditorLeftTabContainer>
        {showThemeModal ? (
          <HESkyLayer onOverlayClick={this._handleCloseThme}>
            <HEModal className="create-project-modal">
              <HEModalHeader
                title={'选择模板'}
                onClose={this._handleCloseThme}
              />
              <HEModalContent className="select-project-modal__content">
                {this._renderTemplates()}
              </HEModalContent>
              <HEModalActions>
                <HEButton secondary={true} onClick={this._handleCloseThme}>
                  {'取消'}
                </HEButton>
                <HEButton onClick={this._handleUseTheme.bind(this)}>
                  {'确定'}
                </HEButton>
              </HEModalActions>
            </HEModal>
          </HESkyLayer>
        ) : null}
      </HEPaper>
    )
  }
}

export default connectToStore(EditorLeftTab)
