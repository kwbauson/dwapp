import React from 'react'
import { Resource, parseProperty } from './resource'

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

export class ViewContainer {
  private defaultView: View = () => (
    <div style={{ background: 'red' }}>NO VIEW FOUND</div>
  )
  private views: { selector: Selector; view: View }[] = []

  get<Get = any, Set = Get>(
    selector: string | Selector | Resource,
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
      .find(x => match(x.selector, realSelector))
    return found ? found.view : this.defaultView
  }

  add<Get = any, Set = Get>(selector: string | Selector, view: View<Get, Set>) {
    if (typeof selector === 'string') {
      selector = parseSelector(selector)
    }
    this.views.push({ selector, view })
  }
}
