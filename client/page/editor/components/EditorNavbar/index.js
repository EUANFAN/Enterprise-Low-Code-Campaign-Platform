import React from 'react'
import classNames from 'classnames'
import { HENavbar } from 'components/HENavbar'
import HEIconButton from 'components/HEIconButton'
import HELink from 'components/HELink'
import HEDropdown from 'components/HEDropdown'
import { HEMenu, HEMenuItem } from 'components/HEMenu'
import ButtonControls from 'components/HEButtonControls'
import './index.less'
import tabMap from 'common/tabMap'
import { connectToStore } from 'components/StoreContext'
import store from 'store/stage'
import LocalStorage from 'common/localStorage'
import jsonpatch from 'fast-json-patch' // 对json数据做处理
import { Modal } from 'antd'
import { WidgetConfigs } from 'widgets'

const ICON_BUTTON_WIDTH = 70
const NAVBAR_LEFT_PART_WIDTH = '375px'

const innerWidgets = god.PageData.innerWidgets || {}
function getValue(project, path) {
  return path
    .split('/')
    .slice(1)
    .reduce((result, seg) => {
      return result[seg]
    }, project)
}
// 忽略某些成分
function isValidPatch(patches, project) {
  let rs = []
  for (let i = 0; i < patches.length; i++) {
    let p = patches[i]
    let ignored = false
    let whiteList = [
      '/lastModified',
      '/lastModifyTime',
      '/logId',
      '/lastPublished',
      '/_id',
      '/themeId',
      /pages\/\d+\/widgets\/\d+\/isSelected/,
      /pages\/\d+\/widgets\/\d+(\/layers\/\d+\/widgets\/\d+)*\/isSelected/,
      /pages\/\d+\/widgets\/\d+(\/layers\/\d+\/widgets\/\d+)*\/adjusted/
    ]

    if (p.op == 'remove' && typeof getValue(project, p.path) == 'function') {
      continue
    }

    whiteList.forEach((item) => {
      if (item instanceof RegExp) {
        if (item.test(p.path)) {
          ignored = true
        }
      } else {
        if (item == p.path) {
          ignored = true
        }
      }
    })

    if (ignored) {
      continue
    }
    rs.push(p)
  }
  return rs.length > 0
}
class DropdownMenuItem extends React.Component {
  _element = React.createRef()

  render() {
    const {
      active,
      iconElement,
      title,
      onClick,
      onClose,
      children,
      className
    } = this.props
    return (
      <HEDropdown
        show={active}
        targetElement={this._element.current}
        onClose={onClose}
        menu={children}
        width={ICON_BUTTON_WIDTH}
        menuTop={57}
      >
        <HEIconButton
          className={className || ''}
          ref={this._element}
          active={active}
          onClick={onClick}
          iconElement={iconElement}
          titleElement={
            <HELink expand={active} floatingArrow={true}>
              {title}
            </HELink>
          }
        />
      </HEDropdown>
    )
  }
}

const NavbarMenuItem = ({ children, onClick }) => (
  <HEMenuItem padding={2} onClick={onClick}>
    {children}
  </HEMenuItem>
)

class EditorNavbar extends React.Component {
  SaveComponent = React.createRef()
  state = { activeMenu: null }

  getNavCenter() {
    // prettier-ignore
    const { onAddWidget, activeMenu, onMenuClose, onMenuOpen, config } = this.props
    let list = []
    if (config) {
      const NAV_CONTROLS = config['NAV_CONTROLS']
      // 这里为什么要拿item.group这个字段去比对？
      const navCenter = tabMap.filter((item) => {
        if (NAV_CONTROLS.indexOf(item.group) != -1) return item
      })
      navCenter.forEach((tab) => {
        const { group, icon, name, isSingle, widgetType } = tab
        if (isSingle) {
          let singleWidget = WidgetConfigs.filter((widget) => {
            return widget.type == widgetType
          })

          list.push(
            <HEIconButton
              key={group}
              className="editor-navbar__content__icon-button"
              iconElement={icon}
              titleElement={<span>{name}</span>}
              onClick={(event) => onAddWidget(event, singleWidget[0])}
            />
          )
        } else {
          const widgets = WidgetConfigs.map((widget) => {
            // prettier-ignore
            const isTextWidgetGroup = widget.group == 'Text' && widget.group == tab.group
            const isGroup =
              widget.group !== 'Text' &&
              widget.group === tab.group &&
              (!widget.version ||
                innerWidgets[widget.type]?.version == widget.version)
            if (isTextWidgetGroup || isGroup) {
              return (
                <NavbarMenuItem
                  key={widget.type}
                  onClick={(event) => onAddWidget(event, widget)}
                >
                  {widget.name}
                </NavbarMenuItem>
              )
            }
          })
          list.push(
            <DropdownMenuItem
              key={tab.group}
              className="editor-navbar__content__icon-button"
              active={activeMenu === group}
              iconElement={icon}
              title={name}
              onClick={(event) => onMenuOpen(event, group)}
              onClose={onMenuClose}
            >
              <HEMenu>{widgets}</HEMenu>
            </DropdownMenuItem>
          )
        }
      })
    }
    return list
  }
  getNavRight() {
    const { store, userInfo, config } = this.props
    let btnList = []
    if (config && config['NAV_OPTIONS']) {
      Object.keys(config['NAV_OPTIONS']).forEach((key, index) => {
        let Control = config['NAV_OPTIONS'][key] != false && ButtonControls[key]
        if (Control) {
          btnList.push(
            <Control
              {...{ ref: key === 'Save' ? this.SaveComponent : '' }}
              key={`${key}-${index}`}
              store={store}
              userInfo={userInfo}
              config={config['NAV_OPTIONS'][key]}
            ></Control>
          )
        }
      })
    }
    return btnList
  }
  needSave = () => {
    return new Promise((resolve, reject) => {
      // 加载历史记录
      let projectOrThemeId = god.PageData.project._id
      LocalStorage.getItem(projectOrThemeId).then(function (data) {
        let stageStoreDataInLocal = null
        if (!data) {
          return reject()
        }
        try {
          stageStoreDataInLocal = JSON.parse(data)
        } catch (__) {
          // do nothing
        }
        let patches = jsonpatch.compare(
          god.PageData.project.revisionData,
          stageStoreDataInLocal
        )
        // 说明有差异
        if (isValidPatch(patches, god.PageData.project.revisionData)) {
          Modal.confirm({
            title: '提示',
            content: '最近更改的还未保存，是否保存到最新？',
            okText: '保存',
            cancelText: '取消',
            onOk() {
              store.init(stageStoreDataInLocal)
              resolve()
            },
            onCancel() {
              reject()
            }
          })
        } else {
          reject()
        }
      })
    })
  }
  pathBack = (config) => {
    if (
      config &&
      config['NAV_LEFT'] &&
      config['NAV_LEFT'].Title === '返回' &&
      !config['NAV_LEFT'].TITLE_FUNC
    ) {
      config['NAV_LEFT']['TITLE_FUNC'] = async () => {
        if (this.SaveComponent.current) {
          // 有保存权限
          try {
            // 需要保存差异
            await this.needSave()
            this.SaveComponent.current.props.config = {
              // 新增保存组件保存成功的回调
              ['afterSave']: () => {
                this.goBack()
              }
            }
            this.SaveComponent.current._handleSave({
              preventDefault: function () {}
            })
          } catch (error) {
            this.goBack()
          }
        } else {
          this.goBack()
        }
      }
    }
  }
  goBack() {
    // prettier-ignore
    if (document.referrer.includes('/projects/') || document.referrer.includes('/theme')) {
      window.location.replace(document.referrer || '/')
    } else if (document.referrer.includes('/project/publish')) {
      if (location.pathname.includes('/theme/')) {
        window.location.replace(location.origin + '/theme')
      } else {
        window.location.replace(location.origin + '/projects/my')
      }
    } else {
      history.go(-1)
    }
  }
  render() {
    const { className: classNameFromProp, config } = this.props
    const className = classNames(['editor-navbar', classNameFromProp])
    this.pathBack(config)
    return (
      <HENavbar
        className={className}
        config={config && config['NAV_LEFT']}
        leftPartWidth={NAVBAR_LEFT_PART_WIDTH}
        actionElement={
          <div className="editor-navbar__actions">{this.getNavRight()}</div>
        }
      >
        {<div className="editor-navbar__content"> {this.getNavCenter()}</div>}
      </HENavbar>
    )
  }
}

export default connectToStore(EditorNavbar)
