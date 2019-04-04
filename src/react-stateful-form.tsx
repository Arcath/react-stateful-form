import * as React from 'react'

export interface FormProps<T, P, K = RenderFunction<T, P>>{
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

  //injectable?: (args: RenderFunctionArguments<T>) => P
  injectable?: InjectFunction<T, P>
}

export type InjectFunction<T, P> = (args: RenderFunctionArguments<T>) => P

export interface RenderFunctionArguments<T>{
  fields: T
  input: InputFunction<T>
  Input: React.FunctionComponent<InputComponentProps<T>>
  valid: (field?: keyof T, value?: any) => boolean
  Select: React.FunctionComponent<SelectComponentProps<T>>
  reset: () => void
  update: (field: keyof T, value: any) => void
}

export type RenderFunction<T, K = {}> = (
  args: RenderFunctionArguments<T> & {inject: () => K}
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

export class StatefulForm<T, P> extends React.Component<FormProps<T, P>, {fields: T}>{
  constructor(props: FormProps<T, P>){
    super(props)

    this.state = {
      fields: props.data
    }
  }

  render(){
    const {data, onSubmit, validator, children: render, injectable} = this.props
    const {fields} = this.state

    const setFields = (fields: T) => {
      this.setState({fields})
    }

    const reset = () => {
      setFields(data)
    }

    const update = (field: keyof T, value: any) => {
      let updated = Object.assign({}, fields)

      updated[field] = value

      setFields(updated)
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

    const inject = () => {
      return injectable({
        fields,
        input,
        Input,
        valid,
        reset,
        update,
        Select
      })
    }

    return <form onSubmit={(e) => {
      e.preventDefault()
      onSubmit(fields, reset)
    }}>
      {render({
        fields,
        input,
        Input,
        valid,
        Select,
        reset,
        update,
        inject
      })}
    </form>
  }
}
