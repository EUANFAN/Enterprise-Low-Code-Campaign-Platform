import CommonPermission from 'config/permission/common/index'
import merge from 'lodash/merge'

let XUEERSI_PERMISSION = merge(CommonPermission, {
  TITLE: '希望学',
  EDITOR: {
    // 客户端
    ClIENT: [
      {
        text: '希望学客户端',
        // TODO: 目前未知作用.
        value: 'jzh'
      },
      {
        text: '优课客户端',
        // TODO: 目前未知作用.
        value: 'sline'
      }
    ]
  },
  PUBLISH: {
    URL: (targetUrl) => {
      return targetUrl
    }
  }
})

export default XUEERSI_PERMISSION
