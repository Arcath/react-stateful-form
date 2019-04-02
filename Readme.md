# React Stateful Form Component

React Stateful Form Component is designed to be a wrapper that takes an object of _fields_ that it handles the state for and form submission.

It can be used to create controller inputs or you can use the built in inputs.

## Usage

```tsx
import {StatefulForm} from 'react-stateful-form-component'

const MyComponent = () => {
  return <StatefulForm
    data={{
      name: '',
      email: ''
    }}
    validator={({field, value}) => {
      switch(field){
        case "name":
          return value.length > 0
        case "email":
          return value.length > 5
      }
    }}
    onSubmit={(data) => {
      // Send off your data to an API or use it in this components state
    }}
  >
    {({input, valid}) => {
      return <div>
        {input('name', ({value, update, valid}) => {
          return <input
            type="text"
            name="name"
            value={value}
            onChange={(e) => update(e.target.value)}
            className={valid() ? 'valid' : 'invalid'}
          />
        })}
        {input('email', ({value, update, valid}) => {
          return <input
            type="text"
            name="name"
            value={value}
            onChange={(e) => update(e.target.value)}
            className={valid() ? 'valid' : 'invalid'}
          />
        })}
        <input type="submit" disabled={!valid()} value="Submit" />
      </div>
    }}
  </StatefulForm>
}
```

### StatefulForm

This is the main component and the only export you normally need to use.

#### data

The object that describes the form. The values in the object are used as the initial values for the form.

```js
{
  name: 'Something',
  email: 'someone@somewhere.com'
}
```

### onSubmit

The callback that gets called when the form is submitted.

```js
(data) => {
  SomeAPI.save(data)
}
```

### validator

The function used to check if a field is valid. If it is not supplied all values are considered valid.

The function is passed an object with 3 properties, `field` the field to check, `value` its current value and `fields` the current form state.

```js
({field, value}) => {
  switch(field){
    case "name":
      return value.length > 0
    case "email":
      return value.length > 5
  }
}
```

> Invalid data will still be passed to the `onSubmit` handler, make sure that you use `valid()` to ensure that the form cannot be submitted whilst invalid.

## Render function

The `children` of `StatefulForm` is a function not a collection of JSX elements like you would expect.

The function is passed an object with 4 properties:

 - `fields` - The current form state
 - `input` - The `Input Handler Function`
 - `Input` - A component that wraps `input`
 - `valid` - The validation checker function. 

## Input Handler Function

The `input` function is used to create your form inputs. It is merely a wrapper that provides field specific functions for you yo build input components.

It has 2 arguments, `field` which is the field you want this input to be and a function that renders the input.

The function is passed an object with 5 properties:

 - `fields` - The current form state.
 - `field` - The field this input is controlling.
 - `update` - A function that updates the value in the forms state.
 - `value` - The fields current value.
 - `valid` - A function that returns a boolean value for the validation status of this field.