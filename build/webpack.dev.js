const common = require('./webpack.common')
const { merge } = require('webpack-merge')
const webpack = require('webpack')

const newConfig = merge(common, {
  devtool: 'eval-source-map',
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      BASE_REQ_URL: "'https://wtest.xiwang.com'"
    })
  ]
})
module.exports = newConfig
