import React from 'react'
import ReactDOM from 'react-dom'
import { App } from './App'

let root = document.getElementById('root')
if (!root) {
  document.body.style.margin = '0px'
  root = document.createElement('div')
  root.id = 'root'
  document.body.appendChild(root)
}

ReactDOM.render(<App />, root)
