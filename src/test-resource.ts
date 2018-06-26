import { makeResource } from './resource'

const getRootResource = () =>
  makeResource('$root', '$root', {
    properties: [
      makeResource('users', getUserResource(), { many: true, create: true }),
      makeResource('roles', getRoleResource(), { many: true, create: true }),
      makeResource('configuration', getConfigResource()),
    ],
  })

const getUserResource = () =>
  makeResource('user', 'user', {
    properties: [
      makeResource('username', 'string'),
      makeResource('roles', getRoleResource(), { many: true }),
    ],
  })

const getRoleResource = () =>
  makeResource('role', 'role', {
    properties: [
      makeResource('role name', 'string'),
      makeResource('users', 'string', { many: true }),
    ],
  })

const getConfigResource = () =>
  makeResource('config', 'config', {
    name: 'config',
    create: true,
    properties: [
      makeResource('configured string', 'string'),
      makeResource('configured number', 'number'),
      makeResource('configured boolean', 'boolean'),
      makeResource('configured date', 'date'),
    ],
  })

export const rootResource = getRootResource()
