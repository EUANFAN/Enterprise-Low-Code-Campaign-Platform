const { getWidgetInfo } = require('../../common/widget.js');
module.exports = async function (ctx) {
  let query = ctx.request.query;
  const { version, type } = query;
  const info = await getWidgetInfo(type, version);
  ctx.data({
    info,
  });
};
