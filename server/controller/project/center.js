module.exports.getPath = '/projects(/.*)?';

module.exports.get = async (ctx) => {
  await ctx.render('project/center');
};

module.exports.auth = true;
