import _ from 'lodash'
import jsYaml from 'js-yaml'
import pluralize from 'pluralize'
import shortid from 'shortid'
import hash from 'object-hash'

export interface Resource<Get = any, Set = Get> {
  name: string
  type: string
  properties: Resource[]
  readonly: boolean
  optional: boolean
  many: boolean
  selected: boolean
  flags: { [x: string]: boolean }
  options: string[][]
  get: () => Promise<Get | undefined>
  set?: (x?: Set) => Promise<void>
  all: () => Promise<Get[]>
}

export const defaultResource: Resource = {
  name: '$name',
  type: '$type',
  properties: [],
  readonly: false,
  optional: false,
  many: false,
  selected: false,
  flags: {},
  options: [],
  get: async () => {},
  set: async (x?: any) => {
    console.log(JSON.stringify(x)) // FIXME
  },
  all: async () => [],
}

export function makeResource<Get = any, Set = Get>(
  name: string,
  type: string | Resource<Get, Set>,
  partial: Partial<Resource<Get, Set>> = {},
): Resource<Get, Set> {
  const typeName = typeof type === 'string' ? type : type.type
  const resource: Resource<Get, Set> = {
    ...defaultResource,
    name,
    type: typeName,
  }
  if (typeof type === 'string') {
    return {
      ...resource,
      ...partial,
    }
  } else {
    return {
      ...resource,
      ...type,
      name,
      ...partial,
    }
  }
}

export function parseProperty(name: string, input: string): Resource {
  const parts = input.split(',')
  const typeParts = parts[0].split(' ')
  const type = typeParts[typeParts.length - 1]
  const typeOptions = typeParts.slice(0, typeParts.length - 1)
  const options = parts.slice(1).map(x => x.split(' '))
  return {
    ...defaultResource,
    name,
    type,
    readonly: typeOptions.includes('readonly'),
    optional: typeOptions.includes('optional'),
    many: typeOptions.includes('many'),
    selected: typeOptions.includes('selected'),
    options,
  }
}

export function makeRootResource(
  definition: string | { [x: string]: any },
): Resource {
  let obj: { [x: string]: any }
  if (typeof definition === 'string') {
    obj = jsYaml.load(definition)!
  } else {
    obj = definition
  }
  const untied = makeRootResourceHelper(obj)
  return tieRootResource(untied, untied)
}

function makeRootResourceHelper(definition: { [x: string]: any }): Resource {
  const rootProperties = Object.keys(definition).map(key => {
    const name = pluralize(key)
    const obj = definition[key]
    const properties = Object.keys(obj).map(k => parseProperty(k, obj[k]))
    return makeResource(name, key, { many: true, properties })
  })
  return makeResource('$root', '$root', { properties: rootProperties })
}

function tieRootResource(resource: Resource, root: Resource): Resource {
  return {
    ...resource,
    properties: resource.properties.map(prop => {
      if (prop.selected) {
        return prop
      } else {
        const found = root.properties.find(x => x.type === prop.type)
        const typeProps = found ? found.properties : prop.properties
        return tieRootResource({ ...prop, properties: typeProps }, root)
      }
    }),
  }
}

export function makeDataResource<Get = any, Set = Get>(
  resource: Resource<Get, Set>,
  data: Set,
  onSet: (data?: Set) => void,
): Resource {
  return {
    ...resource,
    properties: resource.properties.map(prop => {
      if (prop.many) {
        return prop
      } else {
        return {
          ...prop,
          set: async (x: Set) => {
            // FIXME?
            const newData = { ...(data as any), [prop.name]: x }
            console.log(newData)
            onSet(newData)
          },
        }
      }
    }),
    get: async () => data,
  }
}

export function makeJsDbResource(
  root: Resource,
  data: { [x: string]: any[] },
): Resource {
  return {
    ...root,
    properties: root.properties.map(resource =>
      makeJsDbResource(
        {
          ...resource,
          get: async () => data[resource.type] || [],
          set: async (x: any) => {
            const records = data[resource.type] || []
            data[resource.type] = records.concat([x])
          },
          all: async () => data[resource.type] || [],
        },
        data,
      ),
    ),
  }
}
