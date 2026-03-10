/*
 * @Description: 获取用户组织架构相关
 * @Author: jielang
 * @Date: 2020-07-30 23:53:16
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-01-12 18:38:05
 */

const app = global.app

async function getDeptList(ctx) {
  const { mongo } = app.utils
  const db = mongo.db()
  let query = {}
  if (ctx) {
    // 切换事业部角色权限校验
    const { value } = await ctx.validateRoleLimit('chooseBizUnit')
    if (!value) {
      const { userDeptId } = await ctx.getUserInfo()
      query._id = userDeptId
    }
  }
  return await db['bizunit'].find(query)
}

async function getUserDeptInfo(department) {
  const USER_DEPARTMENT = await getDeptList()
  const wxData = USER_DEPARTMENT.find((v) => v.enname === 'xw')
  if (!department) {
    return {
      id: wxData._id,
      name: wxData.name,
      enname: wxData.enname
    }
  }
  for (let i = 0; i < USER_DEPARTMENT.length; i++) {
    for (let j = 0; j < USER_DEPARTMENT[i].queryname.length; j++) {
      const tmp = department.split('-')
      const res = tmp.some((item) => item === USER_DEPARTMENT[i].queryname[j])
      if (res) {
        return {
          id: USER_DEPARTMENT[i]._id,
          name: USER_DEPARTMENT[i].name,
          enname: USER_DEPARTMENT[i].enname
        }
      }
    }
  }

  // 如果上面都没有匹配到 就返回网校的数据
  return {
    id: wxData._id,
    name: wxData.name,
    enname: wxData.enname
  }
}
module.exports = {
  getUserDeptInfo,
  getDeptList
}
