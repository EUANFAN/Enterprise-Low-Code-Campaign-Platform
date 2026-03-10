const webpack = require('webpack');
const path = require('path');
let pkg = require('../package.json');
let port = pkg.clientPort;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
const isDevMode = process.env.NODE_ENV === 'dev';
const babelrc = JSON.parse(
  fs.readFileSync(process.cwd() + '/.babelrc', 'utf8')
);
const { entry, pages } = isDevMode
  ? require('./constant').getEntry()
  : require('./constant').getEntry('other');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: 10 });
const { ModuleFederationPlugin } = require('webpack').container;

let output = {
  path: path.resolve(__dirname, '../dist/client'),
  filename: '[name].[contenthash].js',
  publicPath: `//${pkg.hostname}:${port}/`,
  libraryTarget: 'umd',
  chunkFilename: '[name].[contenthash].js'
};

// const federationUrl = 'http://127.0.0.1:8080/federation.js';
let plugins = [
  new ModuleFederationPlugin({
    name: 'x_core',
    remotes: {
      h5_federation: `promise new Promise(resolve => {
      const version = new Date().getTime()
      const remoteUrlWithVersion = '//res.xiwang.com/federation/federation.js?ver=' + version
      const script = document.createElement('script')
      script.src = remoteUrlWithVersion
      script.onload = () => {
        const proxy = {
          get: (request) => window.h5_federation.get(request),
          init: (arg) => {
            try {
              return window.h5_federation.init(arg)
            } catch(e) {
              console.log('remote container already initialized')
            }
          }
        }
        resolve(proxy)
      }
      document.head.appendChild(script);
    })
    `
    }
  }),

  new HappyPack({
    id: 'js',
    threadPool: happyThreadPool,
    loaders: [
      {
        loader: 'babel-loader',
        options: Object.assign({}, babelrc, { cacheDirectory: true })
      }
    ]
  }),
  // new HappyPack({
  //   id: 'less',
  //   threadPool: happyThreadPool,
  //   loaders: [
  //     { loader: 'style-loader' },
  //     { loader: 'css-loader' },
  //     {
  //       loader: 'less-loader',
  //       options: {
  //         lessOptions: {
  //           relativeUrls: true,
  //           modifyVars: {
  //             // 主题色：ant-design
  //             'primary-color': '#4A82F7',
  //             // 主题色：自定义部分
  //             'blue--beatles': '#4A82F7'
  //           }
  //         }
  //       }
  //     }
  //   ]
  // }),
  new HappyPack({
    id: 'css',
    threadPool: happyThreadPool,
    loaders: [
      { loader: 'style-loader' },
      {
        loader: 'css-loader'
      }
    ]
  }),
  new webpack.DefinePlugin({
    NODE_ENV: JSON.stringify(process.env.NODE_ENV)
  }),
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
    process: 'process/browser'
  })
];

// 如果dev环境，pages为所有的入口，build环境为除preview的入口
pages.forEach((page) => {
  let chunks = ['lib', page];
  let pageName = page.replace('/main', '');
  plugins.push(
    new HtmlWebpackPlugin({
      script: '',
      filename:
        (isDevMode ? './' : path.resolve(__dirname, '../dist/client/page/')) +
        '/' +
        pageName +
        '.html',
      minify: false,
      template: './client/layout/main.html',
      templateParameters: (compilation, assets, options) => {
        return {
          htmlWebpackPlugin: {
            pageName: pageName,
            files: assets,
            options: options,
            isDevMode
          }
        };
      },
      inject: false,
      hash: false,
      cache: true,
      chunks
    })
  );
});

let modules = {
  rules: [
    {
      test: /\.(js|jsx?|tsx?)$/,
      // TODO 因为 hex-rgb 并没有正确的使用 Babel，我们在这里必须帮忙处理。
      // 找一个比较好的库，或自己实践一个
      include: [
        // 表示只解析以下目录，减少loader处理范围
        path.resolve(__dirname, '../client')
      ],
      exclude: /(node_modules\/(?!(hex-rgb|@k9\/x-com)\/).*)|server|output/,
      use: 'happypack/loader?id=js'
    },
    {
      test: /\.(png|jpg|jpeg|gif|swf|svg|woff|woff2|ttf|eot)$/,
      exclude: /(node_modules\/(?!(@k9\/x-com)\/).*)|server|output/,
      // include: [
      //   // 表示只解析以下目录，减少loader处理范围
      //   path.resolve(__dirname, '../client'),
      //   path.resolve(__dirname, '../node_modules/@k9/x-com')
      // ],
      type: 'asset/resource',
      generator: {
        filename: 'asset/imgs/[name].[hash].[ext]'
      }
    },
    {
      test: /\.less$/,
      exclude: /(node_modules\/(?!(antd|@k9\/x-com)\/).*)|server|output/,
      use: [
        { loader: 'style-loader' },
        { loader: 'css-loader' },
        {
          loader: 'less-loader',
          options: {
            lessOptions: {
              relativeUrls: true,
              modifyVars: {
                // 主题色：ant-design
                'primary-color': '#4A82F7',
                // 主题色：自定义部分
                'blue--beatles': '#4A82F7'
              }
            }
          }
        }
      ]
      // use: 'happypack/loader?id=less'
    },
    {
      test: /\.css$/,
      exclude: /server|output/,
      use: 'happypack/loader?id=css'
    }
  ]
};

let alias = babelrc.plugins.find((plugins) => {
  return Array.isArray(plugins) && plugins[0] === 'module-resolver';
})[1].alias;

for (let key of Object.keys(alias)) {
  alias[key] = path.resolve(__dirname, '../', alias[key]);
}

let resolve = {
  extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.less'],
  alias,
  fallback: {
    crypto: false,
    stream: require.resolve('stream-browserify')
  }
};

module.exports = {
  target: 'web',
  cache: {
    // 1. 将缓存类型设置为文件系统
    type: 'filesystem',

    buildDependencies: {
      // 2. 将你的 config 添加为 buildDependency，以便在改变 config 时获得缓存无效
      config: [__filename]

      // 3. 如果你有其他的东西被构建依赖，你可以在这里添加它们
      // 注意，webpack、加载器和所有从你的配置中引用的模块都会被自动添加
    }
  },
  entry,
  output,
  plugins,
  resolve,
  experiments: {
    topLevelAwait: true // 试验性质顶级作用域允许await
  },
  module: modules,
  externals: !isDevMode
    ? {
        'react-dom': 'ReactDOM',
        react: 'React'
      }
    : {},
  performance: {
    hints: false
  },
  stats: {
    assets: true
  }
};
