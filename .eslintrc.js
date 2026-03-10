module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jest: true
  },
  parser: 'babel-eslint',
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
  globals: {
    god: true,
    PageData: true,
    BASE_REQ_URL: true
  },
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true
    }
  },
  plugins: ['react'],
  rules: {
    'no-useless-escape': 'off',
    'linebreak-style': ['error', 'unix'],
    // quotes: ['error', 'single'],
    // semi: [2, 'always'],
    'no-console': 'off',
    'no-prototype-builtins': 0,
    'react/prop-types': [0],
    'semi-spacing': ['error', { before: false, after: true }],
    'object-curly-spacing': ['error', 'always'], // 相同的花括号格式
    'comma-spacing': ['error', { before: false, after: true }], //逗号格式 前无空格，后有空格
    'spaced-comment': ['error', 'always'], // 要求在注释前有空白
    'block-spacing': 'error',
    'func-call-spacing': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'no-multi-spaces': 'error', // 不能有多余空格
    'key-spacing': [
      'error',
      {
        // 对象字面量中冒号的前后空格
        beforeColon: false,
        afterColon: true
      }
    ],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': 'error', // 中缀操作符周围要不要有空格
    'space-before-blocks': ['error', 'always'], // 块语句必须总是至少有一个前置空格
    'arrow-spacing': 'error' // 箭头函数的箭头之前或之后有空格
  },
  settings: {
    react: {
      createClass: 'createReactClass', // Regex for Component Factory to use,
      pragma: 'React', // Pragma to use, default to "React"
      version: 'detect', // React version. "detect" automatically picks the version you have installed.
      flowVersion: '0.53' // Flow version
    }
  }
}
