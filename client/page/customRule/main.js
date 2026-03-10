import 'globals'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

const { rule, userInfo } = god.PageData

ReactDOM.render(
  <App rule={rule} userInfo={userInfo} />,
  document.getElementById('main')
)
