import React from 'react'
import { ViewContainer, ViewProps, View } from './view'

export const views = new ViewContainer()

function dataView<Get = any, Set = Get>(
  DataView: React.ComponentType<ViewProps<Get, Set>>,
): View<Get, Set> {
  return class DataViewContainer extends React.Component<ViewProps<Get, Set>> {
    state = { data: undefined }

    componentDidMount() {
      this.get()
    }

    render() {
      const resource = {
        ...this.props.resource,
        get: this.get,
        set: this.set,
      }
      const { data } = this.state
      return <DataView {...{ resource, data }} />
    }

    get = async () => {
      const data = await this.props.resource.get()
      console.log(data)
      this.setState({ data })
      return data
    }

    set = this.props.resource.set
  }
}

const SingleView = dataView(
  class SingleView extends React.Component<ViewProps> {
    state = { open: this.props.resource.flags.open }

    render() {
      const { resource, data } = this.props
      const { get, set } = resource

      const properties = resource.properties.map((x, i) => {
        const View = views.get(x)
        const get = () => Promise.resolve(data && data[x.name])
        const set = (d?: any) => {
          this.setState({ data: { ...data, [x.name]: d } })
          return Promise.resolve()
        }
        return (
          <div key={x.name} style={{ padding: '4px' }}>
            <View resource={{ ...x, get, set }} />
          </div>
        )
      })

      return !resource.flags.embed ? (
        <div style={{ border: '1px solid black', padding: '4px' }}>
          <span>
            <button onClick={this.toggle} style={{ width: '25px' }}>
              {this.state.open ? '-' : '+'}
            </button>
            {resource.name}
          </span>
          {this.state.open && (
            <div>
              {properties}
              <button onClick={get}>refresh</button>
              {set && <button onClick={set}>save</button>}
            </div>
          )}
        </div>
      ) : (
        properties
      )
    }

    toggle = async () => {
      await this.props.resource.get()
      this.setState({ ...this.state, open: !this.state.open })
    }
  },
)

class ManyView extends React.Component<ViewProps<any[]>> {
  state = { data: [] as any[], open: this.props.resource.flags.open }

  componentDidMount() {
    this.get()
  }

  render() {
    const resource = {
      ...this.props.resource,
      many: false,
    }
    const View = views.get(resource)
    const children = this.state.data.map((x, i) => {
      const resource = {
        ...this.props.resource,
        many: false,
        name: `${i}`,
        flags: { open: true },
      }
      return (
        <div key={i} style={{ padding: '4px' }}>
          <View {...{ resource, data: x }} />
        </div>
      )
    })
    return (
      <div style={{ border: '1px solid black', padding: '4px' }}>
        <span>
          <button onClick={this.toggle} style={{ width: '25px' }}>
            {this.state.open ? '-' : '+'}
          </button>
          {resource.name}
        </span>
        {this.state.open && (
          <div>
            {children}
            <button onClick={this.get}>refresh</button>
            {this.add && <button onClick={this.add}>add</button>}
            {this.clear && <button onClick={this.clear}>clear</button>}
          </div>
        )}
      </div>
    )
  }

  toggle = () => {
    this.setState({ ...this.state, open: !this.state.open })
  }

  get = async () => {
    const data = (await this.props.resource.get()) || []
    this.setState({ data })
  }

  add = () => {
    const data = this.state.data.concat([{}])
    this.setState({ data })
  }

  clear = () => {
    this.setState({ data: [] })
  }
}

views.add('*', SingleView)

views.add('many *', ManyView)

views.add<string>(
  'string',
  dataView(({ resource: { name, set }, data }) => (
    <span>
      {name}:
      <input
        type="text"
        disabled={!set}
        onChange={e => set!(e.target.value)}
        value={data || ''}
      />
      {JSON.stringify(data)}
    </span>
  )),
)

views.add<number>(
  'number',
  dataView(({ resource: { name, set }, data }) => (
    <span>
      {name}:
      <input
        type="number"
        disabled={!set}
        onChange={({ target: { value } }) =>
          value === '' ? undefined : set!(parseFloat(value))
        }
        value={data || ''}
      />
    </span>
  )),
)

views.add<Date>(
  'date',
  dataView(({ resource: { name, set }, data }) => (
    <span>
      {name}:
      <input
        type="date"
        disabled={!set}
        onChange={({ target: { value } }) =>
          value === '' ? undefined : set!(new Date(value))
        }
        value={(data && data.toISOString().substring(0, 10)) || ''}
      />
    </span>
  )),
)

views.add<boolean>(
  'boolean',
  dataView(({ resource: { name, set }, data }) => (
    <span>
      {name}:
      <input
        type="checkbox"
        disabled={!set}
        checked={data || false}
        onChange={({ target: { checked } }) => set!(checked)}
      />
    </span>
  )),
)

views.add('$root', ({ resource }) => {
  const View = views.get('*')
  return <View resource={{ ...resource, flags: { open: true, embed: true } }} />
})
