import React from 'react'
import { views } from './views'
import { defaultResource } from './lib/resource'

export const App = () => {
  const View = views.get('$root')
  return <View resource={defaultResource} />
}
