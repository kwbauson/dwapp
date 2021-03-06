import React from 'react'
import hash from 'object-hash'
import { ViewContainer, dataView, loadOptions, manyDataView } from './lib/view'
import titleCase from 'title-case'
import { Input, Checkbox, Button, DatePicker, Icon } from 'antd'
import FormItem from 'antd/lib/form/FormItem'
import 'antd/dist/antd.css'
import moment from 'moment'

export const views = new ViewContainer()

const ManyView = manyDataView(
  views,
  ({ resource: { name }, mapChildren, open, toggle, refresh, add }) => {
    const children = mapChildren(child => (
      <div style={{ padding: '4px 4px 4px 0px' }}>{child}</div>
    ))
    return (
      <div style={{ border: '1px solid black', padding: '4px' }}>
        <span>
          <button onClick={toggle} style={{ width: '25px' }}>
            {open ? '-' : '+'}
          </button>
          <span style={{ paddingLeft: '4px' }}>{name}</span>
          {open && (
            <span style={{ paddingLeft: '4px' }}>
              <Button onClick={refresh}>refresh</Button>
              {add && <Button onClick={add} icon="file-add" />}
            </span>
          )}
        </span>
        {open && children}
      </div>
    )
  },
)

views.add('many *', ManyView)

const SingleView = dataView(
  views,
  ({
    resource: { set, optional, flags, name },
    data,
    mapChildren,
    open,
    toggle,
    refresh,
  }) => {
    const children = mapChildren(child => (
      <div style={{ padding: '4px 0px 4px 0px' }}>{child}</div>
    ))
    return (
      <div>
        {!flags.embed ? (
          <div style={{ border: '1px solid black', padding: '4px' }}>
            <span>
              <button onClick={toggle} style={{ width: '25px' }}>
                {open ? '-' : '+'}
              </button>
              <span style={{ paddingLeft: '4px' }}>{name}</span>
              {open && (
                <span style={{ paddingLeft: '4px' }}>
                  <button onClick={refresh}>refresh</button>
                  {set && <button onClick={() => set(data)}>save</button>}
                  {set &&
                    optional && <button onClick={() => set()}>delete</button>}
                </span>
              )}
            </span>
            {open && children}
          </div>
        ) : (
          children
        )}
      </div>
    )
  },
)

views.add('*', SingleView)
views.add('optional *', SingleView)

views.add<string>('string', ({ resource: { name, set }, data }) => (
  <FormItem label={titleCase(name)}>
    <Input
      disabled={!set}
      value={data || ''}
      onChange={e => set && set(e.currentTarget.value)}
    />
  </FormItem>
))

views.add<number>('number', ({ resource: { name, set }, data }) => (
  <span>
    {titleCase(name)}:
    <input
      type="number"
      disabled={!set}
      onChange={({ target: { value } }) =>
        value === '' ? undefined : set!(parseFloat(value))
      }
      value={data || ''}
    />
  </span>
))

views.add<moment.Moment>('date', ({ resource: { name, set }, data }) => (
  <FormItem label={titleCase(name)}>
    <DatePicker disabled={!set} defaultValue={data} onChange={e => set!(e)} />
  </FormItem>
))

views.add<boolean>('boolean', ({ resource: { name, set }, data }) => (
  <FormItem label={titleCase(name)}>
    <Checkbox
      disabled={!set}
      checked={data || false}
      onChange={({ target: { checked } }) => set!(checked)}
    />
  </FormItem>
))

const SelectedView = loadOptions(
  ({ resource: { name, many, set }, data, options }) => (
    <div>
      {titleCase(name)}:
      <select
        value={data || (!many ? '' : [])}
        multiple={many}
        name={name}
        disabled={!set}
        onChange={e => set!(e.target.value)}
      >
        {options &&
          options.map((x, i) => {
            const id = hash([x, i])
            // const value = properties.length ? x[properties[0].name] : x
            const value = x[Object.keys(x)[0]]
            return <option {...{ key: id, value }}>{value}</option>
          })}
      </select>
    </div>
  ),
)

views.add('selected *', SelectedView)
views.add('many selected *', SelectedView)
