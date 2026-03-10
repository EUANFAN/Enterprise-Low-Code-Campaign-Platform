const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();
module.exports = async function getInnerWidgets() {
  const pipeline = [
    {
      $match: {
        isInner: true,
        isDeleted: {
          $ne: true,
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: '$name',
        type: '$type',
        category: '$category',
        version: '$version',
        widgetUrl: '$widgetUrl',
        isInner: '$isInner',
        isCommon: '$isCommon',
        icon: '$icon',
        group: '$group',
        useLifecycle: '$useLifecycle',
      },
    },
  ];
  const innerWidgetArr = await db.components.aggregateCursor(...pipeline);
  let innerWidgets = {};
  innerWidgetArr.forEach((component) => {
    innerWidgets[component.type] = component;
  });

  return innerWidgets;
};
