const { merge } = require('webpack-merge')
const common = require('./webpack.common')
const { entry } = require('./constant').getEntry('other')
const webpack = require('webpack')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')

// common.plugins.push(new BundleAnalyzerPlugin({
//   reportFilename: 'static/report.html',
//   analyzerMode: 'static',
//   openAnalyzer: false,
// }));
const publicPathConfig = {
  test: '//m-test.xiwang.com/h5/',
  gray: '//m-gray.xiwang.com/h5/',
  prod: '//m.xiwang.com/h5/'
}

const reqUrlConfig = {
  test: "'https://wtest.xiwang.com'",
  // gray: "'https://wtest.xiwang.com'",
  prod: "'https://w.xiwang.com'"
}

let publicPath = publicPathConfig[process.env.NODE_ENV]
let reqUrl = reqUrlConfig[process.env.NODE_ENV] || reqUrlConfig.test

let config = merge(common, {
  entry: entry,
  devtool: 'cheap-module-source-map',
  mode: 'production',
  output: {
    publicPath: publicPath
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    minimize: true,
    minimizer: [
      (compiler) => {
        const TerserPlugin = require('terser-webpack-plugin')
        new TerserPlugin({
          terserOptions: {
            compress: {}
          }
        }).apply(compiler)
      },
      new CssMinimizerPlugin()
    ]
  },
  plugins: [
    new ProgressBarPlugin(),
    new LodashModuleReplacementPlugin({
      collections: true,
      shorthands: true
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        // TODO: 暂时另开一个变量吧
        ENV: JSON.stringify(process.env.NODE_ENV)
      },
      BASE_REQ_URL: reqUrl
    }),
    new MomentLocalesPlugin({ localesToKeep: ['es-us', 'zh-cn'] })
  ]
})

module.exports = config
