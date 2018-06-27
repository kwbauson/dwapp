import React from 'react'
import { ViewProps } from './view'
import { makeRootResource, makeJsDbResource } from './resource'
import { editor } from 'monaco-editor'
import { views } from './test-views'
const defaultYaml = require('raw-loader!./test-resource.yaml')

export class DebugDwApp extends React.Component<ViewProps> {
  private editor?: editor.IStandaloneCodeEditor
  state = {
    yaml: defaultYaml,
    tab: 'dwapp',
    resource: this.props.resource,
    data: {},
    parsed: false,
    parseOnSwitch: true,
  }
  componentDidMount() {
    this.parseYaml()
  }
  render() {
    const { tab, resource, parsed } = this.state
    const DwApp = views.get(resource, DebugDwApp as any)
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
          </div>
          <div style={tab === 'dwapp' ? {} : { display: 'none' }}>
            <DwApp {...{ resource }} />
          </div>
          <div style={tab === 'editor' ? {} : { display: 'none' }}>
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
    const { yaml, data } = this.state
    const resource = makeJsDbResource(makeRootResource(yaml), data)
    this.setState({ resource, parsed: true })
    Object.assign(window, { resource, data, views })
  }
  private focusTab(tab: string) {
    this.setState({ tab })
  }
}
