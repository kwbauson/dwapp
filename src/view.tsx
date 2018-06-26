import React from 'react'
import { Resource } from './resource'

export type View<Get = any, Set = Get> = React.ComponentType<
  ViewProps<Get, Set>
>

export interface ViewProps<Get = any, Set = Get> {
  resource: Resource<Get, Set>
  data?: Get
}

export interface Selector {
  type: string
  many: boolean
  // create: boolean
}

export function match(a: Selector, b: Selector): boolean {
  const typeMatches = a.type === '*' || a.type === b.type
  return (
    a.many === b.many &&
    // a.optional === b.optional &&
    // (b.create ? a.create === b.create : true) &&
    typeMatches
  )
}

export function parseSelector(selector: string): Selector {
  const parts = selector.split(',')
  const typeParts = parts[0].split(' ')
  const type = typeParts[typeParts.length - 1]
  const typeOptions = typeParts.slice(0, typeParts.length - 1)
  // const options = parts.slice(1).map(x => x.split(' '))
  return {
    type,
    many: typeOptions.includes('many'),
    // optional: typeOptions.includes('optional'),
    // create: typeOptions.includes('create'),
    // options,
  }
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
