import 'globals'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { getStageConfig, getRlueConfig } from 'common/config'

getStageConfig('EDITOR').then(async (res) => {
  if (res.loaded) {
    const config = res.config['EDITOR_RULES']
    console.log(
      '🚀 ~ file: main.js ~ line 10 ~ getStageConfig ~ config',
      config
    )
    const rule = await getRlueConfig(config['ORIGIN'])

    ReactDOM.render(
      <App RULES_CONFIG={rule} EDITOR_RULES={config} config={res.config} />,
      document.getElementById('main')
    )
  }
})
