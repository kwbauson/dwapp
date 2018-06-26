declare module 'react-object-inspector' {
  var ObjectInspector: React.ComponentType<{
    data: any
    initialExpandedPaths?: string[]
  }>
  export = ObjectInspector
}
