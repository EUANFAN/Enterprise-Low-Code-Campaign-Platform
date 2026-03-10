const { db } = require('../utils/mongo');
const instance = db();

const getWidgetInfo = async (type, version) => {
  const widget = await instance.components.find({
    type: type,
  });
  let info;
  if (widget && widget[0] && widget[0].historys) {
    const historys = widget[0].historys;
    info = historys.find((widgetInfo) => {
      return widgetInfo.version == version;
    });
  }
  return info;
};

module.exports = {
  getWidgetInfo,
};
