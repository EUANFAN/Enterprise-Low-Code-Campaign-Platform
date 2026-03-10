module.exports.getPath = '/home(/.*)?';
module.exports.get = async function (ctx) {
  ctx.redirect('/theme');
};
