import React from 'react'
import { Resource, parseProperty, makeDataResource } from './resource'
import hash from 'object-hash'
import _ from 'lodash'

export type View<Get = any, Set = Get> = React.ComponentType<
  ViewProps<Get, Set>
>

export interface ViewProps<Get = any, Set = Get> {
  resource: Resource<Get, Set>
  data?: Get
  options?: Get[]
}

export interface Selector {
  type: string
  readonly: boolean
  optional: boolean
  many: boolean
  selected: boolean
}

export function match(a: Selector, b: Selector): boolean {
  return (
    a.readonly === b.readonly &&
    a.optional === b.optional &&
    a.many === b.many &&
    a.selected === b.selected &&
    (a.type === '*' || a.type === b.type)
  )
}

export function parseSelector(selector: string): Selector {
  return parseProperty('$selector', selector)
}

export const defaultView: View = () => (
  <div style={{ background: 'red' }}>NO VIEW FOUND</div>
)

export class ViewContainer {
  private views: { selector: Selector; view: View }[] = []

  get<Get = any, Set = Get>(
    selector: string | Selector | Resource,
    notView?: View,
  ): View<Get, Set> {
    let realSelector: Selector
    if (typeof selector === 'string') {
      realSelector = parseSelector(selector)
    } else if (typeof selector.type !== 'string') {
      realSelector = { ...selector, type: selector.type } as Selector
    } else {
      realSelector = selector as Selector
    }
    const found = this.views
      .slice()
      .reverse()
      .find(
        x =>
          (!notView || x.view !== notView) && match(x.selector, realSelector),
      )
    return found ? found.view : defaultView
  }

  add<Get = any, Set = Get>(selector: string | Selector, view: View<Get, Set>) {
    if (typeof selector === 'string') {
      selector = parseSelector(selector)
    }
    this.views.push({ selector, view })
  }
}

export function dataView<Get = any, Set = Get>(
  views: ViewContainer,
  DataView: React.ComponentType<DataViewProps<Get, Set>>,
): View<Get, Set> {
  return class DataViewContainer extends React.Component<ViewProps> {
    state = { data: this.props.data, open: this.props.resource.flags.open }

    render() {
      const resource = makeDataResource(
        this.props.resource,
        this.state.data,
        data => this.setState({ data }),
      )
      const { data, open } = this.state
      const { toggle, refresh } = this
      const childrenWithKeys = resource.properties.map(x => {
        const Child = views.get(x)
        const propData = data && data[x.name]
        return { child: <Child resource={x} data={propData} />, key: x.name }
      })
      const children = childrenWithKeys.map(({ child, key }) => (
        <React.Fragment key={key} children={child} />
      ))
      return (
        <DataView
          {...{
            resource,
            data,
            open,
            toggle,
            refresh,
            children,
            mapChildren: f =>
              childrenWithKeys.map(({ child, key }) => (
                <React.Fragment key={key} children={f(child)} />
              )),
          }}
        />
      )
    }

    toggle = async () => {
      if (this.state.open) {
        this.setState({ open: false })
      } else {
        await this.refresh()
        this.setState({ open: true })
      }
    }

    refresh = async () =>
      this.setState({ data: await this.props.resource.get() })
  }
}

export interface DataViewProps<Get, Set> extends ViewProps<Get, Set> {
  open: boolean
  toggle: () => Promise<void>
  refresh: () => Promise<void>
  children: JSX.Element[]
  mapChildren: (f: (child: JSX.Element) => JSX.Element) => JSX.Element[]
}

export function manyDataView<Get = any, Set = Get>(
  views: ViewContainer,
  ManyDataView: React.ComponentType<ManyDataViewProps<Get, Set>>,
): View<Get, Set> {
  return class DataViewContainer extends React.Component<ViewProps> {
    state = {
      data: (this.props.data || []) as any[],
      open: this.props.resource.flags.open,
    }

    render() {
      const resource = {
        ...this.props.resource,
        many: false,
        optional: true,
      }
      const { data, open } = this.state
      const View = views.get(resource)
      const childrenWithKeys = data.map((x, i) => {
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
        return {
          child: <View {...{ resource: r, data: x }} />,
          key: id,
        }
      })
      const children = childrenWithKeys.map(({ child, key }) => (
        <React.Fragment key={key} children={child} />
      ))
      const { toggle, refresh, add } = this
      return (
        <ManyDataView
          {...{
            resource,
            data,
            open,
            toggle,
            refresh,
            children,
            mapChildren: f =>
              childrenWithKeys.map(({ child, key }) => (
                <React.Fragment key={key} children={f(child)} />
              )),
            add,
          }}
        />
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

    refresh = () =>
      this.props.resource
        .get()
        .then(data => this.setState({ data: data || [] }))

    add = async (x: Set) => {
      const data = this.state.data.concat([{}])
      this.setState({ data })
    }
  }
}

export interface ManyDataViewProps<Get, Set>
  extends DataViewProps<Get[], Set[]> {
  add?: (x: Set) => Promise<void>
}

export function loadOptions(OptionsView: View): View {
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
