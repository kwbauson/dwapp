import React from 'react'
import _ from 'lodash'
import hash from 'object-hash'
import { ViewContainer, ViewProps, View } from './view'
import { makeDataResource } from './resource'

export const views = new ViewContainer()

class ManyView extends React.Component<ViewProps<any[]>> {
  state = { data: this.props.data || [], open: this.props.resource.flags.open }

  render() {
    const resource = {
      ...this.props.resource,
      many: false,
      optional: true,
    }
    const { data } = this.state
    const View = views.get(resource)
    const children = data.map((x, i) => {
      const id = hash([i, x])
      const set = async (d?: any) => {
        await (resource.set && resource.set!(d))
        let newData: any[]
        if (_.isUndefined(d)) {
          newData = data.filter((_, j) => i !== j)
        } else {
          newData = data
            .slice(0, i)
            .concat([d])
            .concat(data.slice(i + 1))
        }
        this.setState({ data: newData })
      }
      const r = { ...resource, set, name: `${i}`, flags: { open: true } }
      return (
        <div key={id} style={{ padding: '4px 4px 4px 0px' }}>
          <View {...{ resource: r, data: x }} />
        </div>
      )
    })
    return (
      <div style={{ border: '1px solid black', padding: '4px' }}>
        <span>
          <button onClick={this.toggle} style={{ width: '25px' }}>
            {this.state.open ? '-' : '+'}
          </button>
          <span style={{ paddingLeft: '4px' }}>{resource.name}</span>
          {this.state.open && (
            <span style={{ paddingLeft: '4px' }}>
              <button onClick={this.get}>refresh</button>
              {this.add && <button onClick={this.add}>add</button>}
            </span>
          )}
        </span>
        {this.state.open && children}
      </div>
    )
  }

  toggle = async () => {
    if (this.state.open) {
      this.setState({ open: false })
    } else {
      await this.props.resource.get()
      this.setState({ open: true })
    }
  }

  get = () =>
    this.props.resource.get().then(data => this.setState({ data: data || [] }))

  add = () => {
    const data = this.state.data.concat([{}])
    this.setState({ data })
  }
}

views.add('many *', ManyView)

class SingleView extends React.Component<ViewProps> {
  state = { data: this.props.data, open: this.props.resource.flags.open }

  render() {
    const { data } = this.state
    const resource = makeDataResource(
      this.props.resource,
      this.state.data,
      data => this.setState({ data }),
    )
    const { set, optional } = resource

    const properties = resource.properties.map(x => {
      const View = views.get(x)
      const propData = data && data[x.name]
      return (
        <div key={x.name} style={{ padding: '4px 0px 4px 0px' }}>
          <View resource={x} data={propData} />
        </div>
      )
    })

    return !resource.flags.embed ? (
      <div style={{ border: '1px solid black', padding: '4px' }}>
        <span>
          <button onClick={this.toggle} style={{ width: '25px' }}>
            {this.state.open ? '-' : '+'}
          </button>
          <span style={{ paddingLeft: '4px' }}>{resource.name}</span>
          {this.state.open && (
            <span style={{ paddingLeft: '4px' }}>
              <button onClick={this.get}>refresh</button>
              {set && <button onClick={() => set(data)}>save</button>}
              {set && optional && <button onClick={() => set()}>delete</button>}
            </span>
          )}
        </span>
        {this.state.open && properties}
      </div>
    ) : (
      properties
    )
  }

  toggle = async () => {
    if (this.state.open) {
      this.setState({ open: false })
    } else {
      await this.get()
      this.setState({ open: true })
    }
  }

  get = () => this.props.resource.get().then(data => this.setState({ data }))
}

views.add('*', SingleView)
views.add('optional *', SingleView)

views.add<string>('string', ({ resource: { name, set }, data }) => (
  <span>
    {name}:
    <input
      type="text"
      disabled={!set}
      onChange={e => set!(e.target.value)}
      value={data || ''}
    />
  </span>
))

views.add<number>('number', ({ resource: { name, set }, data }) => (
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
))

views.add<Date>('date', ({ resource: { name, set }, data }) => (
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
))

views.add<boolean>('boolean', ({ resource: { name, set }, data }) => (
  <span>
    {name}:
    <input
      type="checkbox"
      disabled={!set}
      checked={data || false}
      onChange={({ target: { checked } }) => set!(checked)}
    />
  </span>
))

function loadOptions(OptionsView: View): View {
  return class OptionsViewContainer extends React.Component<ViewProps> {
    state = { options: [] }

    async componentDidMount() {
      const options = await this.props.resource.all()
      this.setState({ options })
    }

    render() {
      const { options } = this.state
      return <OptionsView {...{ ...this.props, options }} />
    }
  }
}

const SelectedView: View = loadOptions(
  ({ resource: { name, many, set }, data, options }) => (
    <div>
      {name}:
      <select
        value={data || (!many ? '' : [])}
        multiple={many}
        name={name}
        disabled={!set}
        onChange={e => set!(e.target.value)}
      >
        {options &&
          options.map((x, i) => {
            const id = hash([x, i])
            // const value = properties.length ? x[properties[0].name] : x
            const value = x[Object.keys(x)[0]]
            return <option {...{ key: id, value }}>{value}</option>
          })}
      </select>
    </div>
  ),
)

views.add('selected *', SelectedView)
views.add('many selected *', SelectedView)

views.add('$root', ({ resource }) => {
  const View = views.get('*')
  return <View resource={{ ...resource, flags: { open: true, embed: true } }} />
})
