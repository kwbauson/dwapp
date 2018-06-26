import React from 'react'
import MonacoEditor from 'react-monaco-editor'
import { editor } from 'monaco-editor'
import ObjectInspector from 'react-object-inspector'
import { views } from './test-views'
import { makeRootResource, makeJsDataResource } from './resource'
const defaultYaml = require('raw-loader!./test-resource.yaml')

export class App extends React.Component {
  private editor?: editor.IStandaloneCodeEditor

  state = {
    yaml: defaultYaml,
    tab: 'dwapp',
    resource: makeRootResource(defaultYaml),
    data: {},
    parsed: false,
    parseOnSwitch: true,
  }

  componentDidMount() {
    this.parseYaml()
  }

  render() {
    const { tab, data, parsed } = this.state
    const resource = {
      ...this.state.resource,
      set: async (x?: any) => {
        this.state.resource.set && (await this.state.resource.set(x))
        this.setState(this.state)
      },
    }
    const DwApp = views.get(resource)
    return (
      parsed && (
        <div>
          <div
            style={{
              borderBottom: '1px solid black',
              marginBottom: '2px',
              paddingBottom: '2px',
            }}
          >
            <button onClick={this.focusDwApp}>dwapp</button>
            <button onClick={this.focusEditor}>editor</button>
            <button onClick={this.focusData}>data</button>
          </div>
          <div style={tab === 'dwapp' ? {} : { display: 'none' }}>
            <DwApp {...{ resource, data }} />
          </div>
          <div style={tab === 'editor' ? {} : { display: 'none' }}>
            <MonacoEditor
              theme="vs-dark"
              language="yaml"
              height="600"
              value={this.state.yaml}
              onChange={yaml => this.setState({ yaml })}
              editorDidMount={this.editorDidMount}
            />
            <button onClick={this.parseYaml}>parse yaml</button>
            <span>
              <input
                type="checkbox"
                checked={this.state.parseOnSwitch}
                onChange={e =>
                  this.setState({ parseOnSwitch: e.target.checked })
                }
              />
              parse when switching to dwapp
            </span>
          </div>
          <div style={tab === 'data' ? {} : { display: 'none' }}>
            <ObjectInspector {...{ data, initialExpandedPaths: ['root'] }} />
            <button onClick={this.clearData}>clear</button>
          </div>
        </div>
      )
    )
  }

  editorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    this.editor = editor
  }

  focusDwApp = () => {
    if (this.state.parseOnSwitch) {
      this.parseYaml()
    }
    this.focusTab('dwapp')
  }

  focusEditor = () => {
    this.setState({ tab: 'editor' }, () => {
      if (this.editor) {
        this.editor.focus()
        this.editor.layout()
      }
    })
  }

  focusData = () => this.focusTab('data')

  parseYaml = () => {
    const { data } = this.state
    const resource = makeRootResource(this.state.yaml)
    this.setState({ resource, parsed: true })
    Object.assign(window, { resource, data })
  }

  clearData = () => {
    this.setState({ data: {} })
  }

  private focusTab(tab: string) {
    this.setState({ tab })
  }
}
