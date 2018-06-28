import { DebugDwApp } from './DebugDwApp'
import { ViewContainer } from './lib/view'

export const views = new ViewContainer()

views.add('$root', DebugDwApp)
