/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:01:37
 */
/**
 * 获取组件列表
 * @param {boolean} deleted 是否删除
 * @param {string} q 组件关键字
 * @param {string} group 组件分组
 * @param {string} type action | widget
 * @param {string} onlySetuped true  是否已安装
 * @param {boolean} onlyUsed 是否已使用
 * @param {Array} selectedTags 标签
 */

const { mongo } = global.app.utils;
const ObjectId = mongo.pmongo.ObjectId;
module.exports = async function (ctx) {
  let query = ctx.request.body;
  let current = (query.current || 1) - 1;
  let pageSize = Math.min(query.pageSize || 8, 20);
  let db = global.app.utils.mongo.db();
  const { userDeptId: myUserDeptId, userId } = await ctx.getUserInfo();
  let dbQuery = {};
  if (query.deleted) {
    dbQuery['isDeleted'] = true;
  } else {
    // 过滤被删除的组件
    dbQuery['$and'] = [
      {
        $or: [
          {
            isDeleted: false,
          },
          {
            isDeleted: {
              $exists: false,
            },
          },
        ],
      },
    ];
  }
  if (query.q) {
    if (query.precise) {
      dbQuery['$or'] = [{ type: query.q }];
    } else {
      dbQuery['$or'] = [
        {
          name: {
            $regex: new RegExp(query.q, 'ig'),
          },
        },
        {
          name_cn: {
            $regex: new RegExp(query.q, 'ig'),
          },
        },
        {
          type: {
            $regex: new RegExp(query.q, 'ig'),
          },
        },
      ];
    }
  }
  if (query.group) {
    if (query.group != 'all') {
      dbQuery['group'] = query.group;
    }
  } else {
    dbQuery['group'] = null;
    dbQuery['isInner'] = {
      $ne: true,
    };
  }
  if (query.type) {
    dbQuery['category'] = query.type;
  }
  if (query.componentPlat) {
    dbQuery['platform'] = {
      $in: query.componentPlat.split(','),
    };
  }
  if (query.tagType && query.tagType !== 'all') {
    dbQuery['tagType'] = query.tagType;
  }
  if (query.selectedTags) {
    dbQuery['tag'] = {
      $in: query.selectedTags.map((tag) => ObjectId(tag)),
    };
  }
  try {
    // 从用户表中获取已经安装外部组件列表，用于在组件库中显示
    let currentUserInfo = await db.users.findOne({
      userId: userId,
    });
    let installedComponents = [];
    if (currentUserInfo) {
      for (var key in currentUserInfo.components) {
        installedComponents.push(key);
      }
    }
    let queryTypeComponents = [];
    if (query.onlySetuped == 'true') {
      queryTypeComponents = [...installedComponents];
      dbQuery['type'] = {
        $in: queryTypeComponents,
      };
    }
    if (query.onlyUsed) {
      queryTypeComponents = [...queryTypeComponents, ...query.onlyUsed];
      dbQuery['type'] = {
        $in: queryTypeComponents,
      };
    }
    let totalCount = await db.components.count(dbQuery);
    let widgets = await db.components.aggregateCursor(
      {
        $match: dbQuery,
      },
      {
        $lookup: {
          from: 'tags', // tags
          localField: 'tag', // components 表关联的字段
          foreignField: '_id', // tags 表关联的字段
          as: 'tags',
        },
      },
      { $skip: Number(current * pageSize) },
      { $limit: Number(pageSize) },
      { $sort: { count: -1 } }
    );
    widgets = widgets.map(function (widget) {
      let isSetuped = false;
      let canUpdate = false;

      if (~installedComponents.indexOf(widget.type)) {
        isSetuped = true;
      }
      return {
        _id: widget._id,
        type: widget.type,
        name: widget.name,
        desc: widget.desc,
        category: widget.category,
        version: widget.version,
        lastModify: widget.lastModify,
        isSetuped: isSetuped,
        canUpdate: canUpdate,
        historys: widget.historys,
        isInner: widget.isInner,
        widgetUrl: widget.widgetUrl,
        userDeptId: widget.userDeptId,
        count: widget.count,
        timesUsedOnline: widget.timesUsedOnline,
        platform: widget.platform,
        tag: widget.tag,
        tags: widget.tags,
        tagType: widget.tagType,
        developers: widget.developers,
        descUrl: widget.descUrl,
        xcli: widget.xcli
      };
    });

    ctx.data({
      totalCount: totalCount,
      widgets: widgets,
      current: (Math.floor(totalCount / pageSize) >= current ? current : 0) + 1,
      onlySetuped: query.onlySetuped == 'true' ? true : false,
    });
  } catch (error) {
    console.log('error', error);
  }
};
