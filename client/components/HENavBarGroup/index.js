/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-06-05 14:33:04
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:03:14
 */
import React from 'react'
import { HENavbar, HENavbarPageList } from 'components/HENavbar'
import DropdownMenuItem from '../../page/components/UserDropdownMenu/DropdownMenuItem'
import { HEMenu, HEMenuItem } from 'components/HEMenu'
import User from 'components/icons/User'
import './index.less'
import HESelect from 'components/HESelect'
import QueryString from 'common/queryString'
import { validateRoleLimit } from 'common/utils'
const { userInfo } = god.PageData

const PAGES = [
  // TODO: 暂时关闭模板中心
  // { key: 'theme', name: '模板中心', permissionName: 'themesCenter' },
  { key: 'projects', name: '我的项目', permissionName: 'projectCenter' },
  { key: 'resources', name: '资源列表' },
  {
    key: 'monster/drawconfig',
    name: '管理后台',
    permissionName: 'dataPlatform'
  },
  // TODO：暂时关闭帮助中心
  // { key: 'docs', name: '帮助中心' }
]
let pages = []
PAGES.forEach((page) => {
  if (!(page.permissionName && !validateRoleLimit(page.permissionName))) {
    pages.push(page)
  }
})

const ROOT_PATH_REGEX = /^\/([a-z0-9]+)/

const getRootRoute = (pathname) => {
  const match = ROOT_PATH_REGEX.exec(pathname)

  if (match) {
    return match[1]
  }

  throw new Error('无法匹配顶层路由')
}

const NavbarMenuItem = ({ children, onClick }) => (
  <HEMenuItem padding={2} onClick={onClick}>
    {children}
  </HEMenuItem>
)

export default class HENavbarGroup extends React.Component {
  state = {
    menuList: false,
    department:
      window.PageData.deptList.length == 1
        ? window.PageData.deptList[0]._id
        : '', // 部门标识
    departmentList: window.PageData.deptList
  }

  _handleLogOut = async () => {
    god.location.href = '/logout/index'
  }

  _handleMenuOpen = () => {
    this.setState((preState) => ({
      menuList: !preState.menuList
    }))
  }
  _handleMenuClose = () => {
    this.setState({
      menuList: false
    })
  }

  _handlePageChange = (event, nextKey) => {
    if (nextKey == 'docs') {
      if (god.location.hostname.indexOf('editor-dev') > -1) {
        return god.open('https://editor.xiwang.com/docs/guide/')
      }
      return god.open(
        god.location.protocol + '//' + god.location.hostname + '/docs/guide/'
      )
    }
    if (nextKey.includes('monster')) {
      god.open(`/${nextKey}`)
    } else {
      god.location.replace(`/${nextKey}`)
    }
  }
  // 加工下拉框数据
  _handleDepartmentList(departmentList) {
    let options = []
    options = [
      {
        key: '所有事业部',
        value: ''
      }
    ]
    departmentList.forEach((item) => {
      const { _id: value, name: key } = item
      options.push({
        key,
        value
      })
    })
    return options
  }
  // 选择部门
  _handleDepartmentSelect = (event, id) => {
    this.setState({
      department: id
    })
    this.props.onSelect(id || 'all')
  }
  _getDepartmentFromUrl() {
    let { department = '' } = QueryString.parse(location.search)
    return department
  }
  async componentDidMount() {
    // 获取 department
    let department = this._getDepartmentFromUrl()
    if (department) {
      this.setState({
        department: department
      })
    }
  }
  render() {
    const selectedPage = getRootRoute(location.pathname)
    const { department, departmentList } = this.state
    const options = this._handleDepartmentList(departmentList)
    const { showDepartmentSelect } = this.props
    return (
      <HENavbar
        actionElement={
          <>
            {/* TODO：暂时关闭切换部门的下拉框入口 */}
            {false && showDepartmentSelect && validateRoleLimit('chooseBizUnit') && (
              <div className="department-select">
                <HESelect
                  value={department}
                  onSelect={this._handleDepartmentSelect}
                  options={options}
                  className="department-select__content"
                ></HESelect>
              </div>
            )}
            <div className="h5__navbar__user-icon">
              <DropdownMenuItem
                iconElement={<User />}
                active={this.state.menuList}
                title={userInfo.userId}
                onClick={this._handleMenuOpen}
                onClose={this._handleMenuClose}
                menuTop={20}
              >
                <HEMenu>
                  <NavbarMenuItem onClick={this._handleLogOut}>
                    {'退出登录'}
                  </NavbarMenuItem>
                </HEMenu>
              </DropdownMenuItem>
            </div>
          </>
        }
      >
        <HENavbarPageList
          pages={pages}
          selectedPage={selectedPage}
          onPageChange={this._handlePageChange}
        />
      </HENavbar>
    )
  }
}
