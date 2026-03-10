var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var pkg = require('../package.json')
var port = pkg.clientPort
var config = require('./webpack.dev')
const { merge } = require('webpack-merge')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

if (process.env.PAGE) {
  var entry = config.entry
  for (var pro in config.entry) {
    if (entry[pro].indexOf(process.env.PAGE) == -1) {
      delete entry[pro]
    }
  }
}
const newConfig = merge(config, {
  plugins: [new webpack.HotModuleReplacementPlugin(), new ReactRefreshPlugin()],
  output: { publicPath: '//' + pkg.hostname + ':' + port + '/' }
})
var compiler = webpack(newConfig)
var server = new WebpackDevServer(compiler, {
  publicPath: '/',
  hot: true,
  watchOptions: {
    aggregateTimeout: 300,
    ignored: /node_modules/
  },
  sockPort: port,
  stats: {
    colors: true,
    timings: true,
    modules: false,
    assets: true,
    entrypoints: false,
    assetsSort: 'field',
    builtAt: true,
    chunkRelations: true,
    cached: false,
    cachedAssets: false,
    children: true,
    chunks: false,
    chunkGroups: false,
    chunkModules: false,
    chunkOrigins: false,
    performance: true,
    errors: true,
    warnings: false
  },
  // headers: {
  //   'Access-Control-Allow-Origin': '*',
  //   'Access-Control-Allow-Methods': '*',
  //   'Access-Control-Allow-Headers': '*'
  // },
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers':
      'X-Requested-With, content-type, Authorization'
  },
  disableHostCheck: true
})
server.listen(port)
