const { getAllChooseResult } = require('../api/utils/AllChooseUtils');
const { mongo } = global.app.utils;
const db = mongo.db();
const { ObjectId } = mongo.pmongo;
const { compact, uniqBy } = require('lodash');

const getComponents = async (ids) => {
  const pipeline = [
    {
      $match: {
        _id: {
          $in: ids,
        },
      },
    },
    {
      $unwind: '$revisionData.pages',
    },
    {
      $project: {
        triggers: '$revisionData.pages.triggers',
        widgets: '$revisionData.pages.widgets',
      },
    },
    {
      $unwind: {
        path: '$widgets',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$triggers',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: '$_id',
        triggers: {
          $addToSet: '$triggers',
        },
        widgets: {
          $addToSet: '$widgets',
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        triggers: '$triggers',
        widgets: '$widgets',
      },
    },
  ];
  const projects = await db.projects.aggregateCursor(...pipeline);
  const widgets = getWidgets(projects);
  const triggers = getTriggers(projects);
  const widgetsTrigger = deleteDuplicate(getTriggers(widgets));
  return {
    widgets: uniqBy(widgets, 'type'),
    triggers: deleteDuplicate(triggers),
    widgetsTriggers: widgetsTrigger,
  };
};

function deleteDuplicate(triggers) {
  let newTriggers = [];
  let typeEventMap = {};
  triggers.forEach((trigger) => {
    const typeAndEvent = trigger.type + trigger.event;
    if (trigger.type && trigger.event && !typeEventMap[typeAndEvent]) {
      typeEventMap[typeAndEvent] = true;
      newTriggers.push(trigger);
    }
  });
  return newTriggers;
}

function getTriggers(layers, componentArr = []) {
  layers.forEach((layer) => {
    componentArr = compact(componentArr.concat(layer.triggers));
  });
  return componentArr;
}

function getWidgets(layers, componentArr = []) {
  layers.forEach((layer) => {
    if (layer.widgets) {
      componentArr = compact(componentArr.concat(layer.widgets));
      componentArr = getWidgets(layer.widgets, componentArr);
    }
    if (layer.layers) {
      componentArr = getWidgets(layer.layers, componentArr);
    }
  });
  return componentArr;
}

module.exports.post = async function (ctx) {
  const {
    request: {
      body: { id, chooseAll, noSelectIds, roleId, folderId },
    },
  } = ctx;
  let ids = [];
  // 用户选择全选
  if (chooseAll === 'true') {
    let results = await getAllChooseResult(
      ctx,
      noSelectIds,
      roleId,
      folderId,
      'projects'
    );
    let hasFolder = results.some((project) => {
      return project.isFolder;
    });
    if (hasFolder) {
      return ctx.data({
        stat: -1,
        message: '批量修改组件仅支持修改文件',
      });
    } else {
      ids = results.map((item) => item._id);
    }
  } else {
    ids = id.split(/,/);
  }
  ids = ids.map((item) => {
    if (item) {
      return ObjectId(item);
    }
  });
  const data = await getComponents(ids);
  return ctx.data(data);
};

module.exports.post.auth = true;
