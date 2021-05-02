import React from 'react'
import capitalize from 'lodash/capitalize'

import Input from './Input'

function Address ({ address, name, handleChange }) {
  return (
    <div className='pb-4'>
      <h2>{capitalize(name)}</h2>

      {Object.entries(address).map(([key, value], i) => {
        return (
          <Input
            key={key}
            id={`${name}.${key}`}
            label={capitalize(key)}
            onChange={handleChange}
            defaultValue={value}
          />
        )
      })}
    </div>
  )
}

export default Address
