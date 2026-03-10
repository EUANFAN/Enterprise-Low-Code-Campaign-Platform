let serviceAPI = {};

const env = global.app.env;

serviceAPI = require(`../config/${env}/3rd`);

module.exports = {
  serviceAPI,
};
