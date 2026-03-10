module.exports.getPath = '/groups(/.*)?';

module.exports.get = async (ctx) => {
  await ctx.render('groups');
};

module.exports.auth = true;
