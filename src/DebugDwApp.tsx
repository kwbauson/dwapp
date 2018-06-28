import React from 'react'
import { ViewProps, ViewContainer } from './lib/view'
import { makeRootResource, makeJsDbResource } from './lib/resource'
import { editor } from 'monaco-editor'
import { views as plainViews } from './plain-test-views'
import { views as materialViews } from './material-test-views'
import { views as antdViews } from './antd-test-views'
import { views as semanticViews } from './semantic-test-views'
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
    views: semanticViews,
  }
  componentDidMount() {
    this.parseYaml()
  }
  render() {
    const { tab, resource, parsed, views } = this.state
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
            <span style={{ paddingRight: '50px' }} />
            <button onClick={this.setViews(plainViews)}>plain</button>
            <button onClick={this.setViews(materialViews)}>material</button>
            <button onClick={this.setViews(antdViews)}>antd</button>
            <button onClick={this.setViews(semanticViews)}>semantic</button>
          </div>
          <div style={tab === 'dwapp' ? {} : { display: 'none' }}>
            <DwApp
              {...{
                resource: { ...resource, flags: { open: true, embed: true } },
              }}
            />
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
    Object.assign(window, { resource, data, plainViews })
  }
  private focusTab(tab: string) {
    this.setState({ tab })
  }

  private setViews(views: ViewContainer) {
    return () => this.setState({ views })
  }
}
