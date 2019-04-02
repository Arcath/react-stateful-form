import * as React from 'react'

const {useState} = React

export interface FormProps<T, K = RenderFunction<T>>{
  /** The initial data for the form */
  data: T
  /** A function that returns the rendered output for the form */
  children: K
  /** 
   * Called when the form is submitted.
   * 
   * `data` will match the object passed to `StatefulForm` with any changes made to it.
   */
  onSubmit: (data: T, reset: () => void) => void

  /**
   * (optional) used to validate the data in the form. 
   */
  validator?: ValidatorFunction<T>
}

export type RenderFunction<T, K = {}> = (
  args: {
    fields: T
    input: InputFunction<T>
    Input: React.FunctionComponent<InputComponentProps<T>>
    valid: (field?: keyof T, value?: any) => boolean
    Select: React.FunctionComponent<SelectComponentProps<T>>
    reset: () => void
  } & K
) => React.ReactElement

export type ValidatorFunction<T> = (
  args: {
    /** The field that needs validating. */
    field: keyof T,
    /** The fields current value. */
    value: any
    /** All the fields current values. */
    fields: T
  }
) => string | boolean

export type ValidatorResponse<T> = Record<keyof T, string | boolean>

export type InputFunction<T> = (field: keyof T, f: InputRenderFunction<T>) => React.ReactElement

export type InputRenderFunction<T> = (args: InputRenderFunctionArguments<T>) => React.ReactElement

export interface InputRenderFunctionArguments<T>{
  fields: T
  field: keyof T
  update: (value: any) => void
  value: any
  valid: () => boolean
  reset: () => void
}

export interface InputComponentProps<T>{
  field: keyof T
  type?: string
}

export interface SelectComponentProps<T>{
  field: keyof T
  options: {value: any, label: string}[]
}

/** A simple function that returns the keys of `object` with the type `(keyof object)[]` instead of `string[]` */
const keys = function<T>(object: T): (keyof T)[]{
  return Object.keys(object) as any
}

export const StatefulForm = function<T>({
  children: render,
  data,
  onSubmit,
  validator
}: FormProps<T>){
  const [fields, setFields] = useState(data)

  const reset = () => {
    setFields(data)
  }

  const input: InputFunction<T> = (field, f) => {
    const update = (value: any) => {
      let updated = Object.assign({}, fields)

      updated[field] = value

      setFields(updated)
    }

    const valid = () => {
      if(!validator) return true

      return !!validator({
        field,
        value: fields[field],
        fields
      })
    }

    const reset = () => {
      update(data[field])
    }

    return f({
      fields,
      field,
      update,
      value: fields[field],
      valid,
      reset
    })
  }

  const Input: React.FunctionComponent<InputComponentProps<T>> = ({field, type}) => {
    return input(field, ({value, update}) => {
      return <input name={field as string} type={type ? type : 'text'} value={value} onChange={(e) => update(e.target.value)} />
    })
  }

  const Select: React.FunctionComponent<SelectComponentProps<T>> = ({field, options}) => {
    return input(field, ({value, update}) => {
      return <select name={field as string} onChange={(e) => update(e.target.value)} value={value}>
        {options.map((option) => {
          return <option value={option.value} key={option.value}>{option.label}</option>
        })}
      </select>
    })
  }

  const valid = (field?: keyof T, value?: any) => {
    if(!validator){
      return true
    }

    const response: Partial<ValidatorResponse<T>> = {}

    keys(data).forEach((key) => {
      response[key] = validator({
        field: key,
        value: fields[key],
        fields: data
      })
    })

    if(!field){
      return Object.keys(data).reduce((test, field) => {
        return (test && !!response[field])
      }, true)
    }

    return !!response[field]
  }

  return <form onSubmit={() => onSubmit(fields, reset)}>
    {render({
      fields,
      input,
      Input,
      valid,
      Select,
      reset
    })}
  </form>
}
