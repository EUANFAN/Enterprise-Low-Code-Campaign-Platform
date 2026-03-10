const { ThemeTypes } = require('../../constants');
module.exports.getPath = '/resources(/.*)?';

module.exports.get = async (ctx) => {
  await ctx.render('resources', {
    themeTypes: ThemeTypes,
  });
};

module.exports.auth = true;
