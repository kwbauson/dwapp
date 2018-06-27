import React from 'react'
import { views } from './test-views'
import { defaultResource } from './resource'

export const App = () => {
  const View = views.get('$root')
  return <View resource={defaultResource} />
}
