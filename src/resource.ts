import _ from 'lodash'
import jsYaml from 'js-yaml'
import pluralize from 'pluralize'

export interface Resource<Get = any, Set = Get> {
  name: string
  type: string
  properties: Resource[]
  many: boolean
  optional: boolean
  create: boolean
  readonly: boolean
  flags: { [x: string]: boolean }
  options: string[][]
  get: () => Promise<Get | undefined>
  set?: (x?: Set) => Promise<void>
  all: () => Promise<Get[]>
}

export function makeResource<Get = any, Set = Get>(
  name: string,
  type: string | Resource<Get, Set>,
  partial: Partial<Resource<Get, Set>> = {},
): Resource<Get, Set> {
  const typeName = typeof type === 'string' ? type : type.type
  const defaultResource: Resource<Get, Set> = {
    name,
    type: typeName,
    properties: [],
    many: false,
    optional: false,
    create: false,
    readonly: false,
    flags: {},
    options: [],
    get: () => Promise.resolve(undefined),
    set: (x?: Set) => {
      console.log(JSON.stringify(x))
      return Promise.resolve()
    },
    all: () => Promise.resolve([]),
  }
  if (typeof type === 'string') {
    return {
      ...defaultResource,
      ...partial,
    }
  } else {
    return {
      ...defaultResource,
      ...type,
      name,
      ...partial,
    }
  }
}

export function makeJsDataResource<Get, Set>(
  resource: Resource<Get, Set>,
  data: Set,
  onSet?: (data?: Set) => void,
): Resource {
  return {
    ...resource,
    properties: resource.properties.map(p => {
      if (!p.many && p.properties.length > 0) {
        const newData = {}
        if (!data.hasOwnProperty(p.name)) {
          ;(data as any)[p.name] = newData
        }
        return makeJsDataResource(p, newData, () => onSet && onSet(data))
      } else {
        return { ...p, get: () => Promise.resolve([]) }
      }
    }),
    get: () => Promise.resolve(_.cloneDeep(data)),
    set: (x?: Set) => {
      onSet && onSet(data)
      return Promise.resolve()
    },
  }
}

export function makeRootResource(
  definition: string | { [x: string]: any },
  root = true,
): Resource {
  if (typeof definition === 'string') {
    const obj = jsYaml.load(definition)!
    return makeRootResource(obj)
  }
  const rootProperties = Object.keys(definition).map(key => {
    const name = root ? pluralize(key) : key
    const obj = definition[key]
    const properties = Object.keys(obj).map(k => parseProperty(k, obj[k]))
    return makeResource(name, key, { many: true, properties })
  })
  return makeResource('$root', '$root', { properties: rootProperties })
}

function parseProperty(name: string, input: string): Resource {
  const parts = input.split(',')
  const typeParts = parts[0].split(' ')
  const type = typeParts[typeParts.length - 1]
  const typeOptions = typeParts.slice(0, typeParts.length - 1)
  const options = parts.slice(1).map(x => x.split(' '))
  return {
    name,
    type,
    many: typeOptions.includes('many'),
    optional: typeOptions.includes('optional'),
    create: typeOptions.includes('create'),
    options,
    properties: [],
    readonly: typeOptions.includes('readonly'),
    flags: {},
    get: () => Promise.resolve(),
    all: () => Promise.resolve([]),
  }
}
