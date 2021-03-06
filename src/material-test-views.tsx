import React from 'react'
import { ViewContainer, manyDataView, dataView, loadOptions } from './lib/view'
import titleCase from 'title-case'
import hash from 'object-hash'
import {
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Collapse,
  Card,
  CardHeader,
  CardContent,
  CardActions,
} from '@material-ui/core'
import UpArrowIcon from '@material-ui/icons/ArrowDropUp'
import DownArrowIcon from '@material-ui/icons/ArrowDropDown'
import CreateIcon from '@material-ui/icons/Create'
import RefreshIcon from '@material-ui/icons/Refresh'

export const views = new ViewContainer()

const ManyView = manyDataView(
  views,
  ({ resource: { name }, mapChildren, open, toggle, refresh, add }) => {
    const children = mapChildren(child => (
      <div style={{ padding: '4px 4px 4px 0px' }}>{child}</div>
    ))
    return (
      <Card>
        <CardHeader
          title={titleCase(name)}
          action={
            <IconButton onClick={toggle}>
              {open ? <UpArrowIcon /> : <DownArrowIcon />}
            </IconButton>
          }
        />
        <CardContent>{open && children}</CardContent>
        {open && (
          <CardActions>
            <IconButton onClick={refresh}>
              <RefreshIcon />
            </IconButton>
            {add && (
              <IconButton onClick={add}>
                <CreateIcon />
              </IconButton>
            )}
          </CardActions>
        )}
      </Card>
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
  <TextField
    label={titleCase(name)}
    type="text"
    disabled={!set}
    value={data || ''}
    onChange={e => set && set(e.target.value)}
  />
))

views.add<number>('number', ({ resource: { name, set }, data }) => (
  <TextField
    label={titleCase(name)}
    type="number"
    disabled={!set}
    onChange={({ target: { value } }) =>
      value === '' ? undefined : set!(parseFloat(value))
    }
    value={data || ''}
  />
))

views.add<Date>('date', ({ resource: { name, set }, data }) => (
  <TextField
    label={titleCase(name)}
    type="date"
    disabled={!set}
    value={(data && data.toISOString().substring(0, 10)) || ''}
    onChange={({ target: { value } }) =>
      value === '' ? undefined : set!(new Date(value))
    }
    InputLabelProps={{ shrink: true }}
  />
))

views.add<boolean>('boolean', ({ resource: { name, set }, data }) => (
  <FormControlLabel
    label={titleCase(name)}
    control={
      <Switch
        type="checkbox"
        disabled={!set}
        checked={data || false}
        onChange={({ target: { checked } }) => set!(checked)}
      />
    }
  />
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
