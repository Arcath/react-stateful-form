import * as React from 'react'
import {configure, shallow, mount} from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

import {StatefulForm, FormProps, RenderFunction} from './react-stateful-form'

describe('React Stateful Form', () => {
  it('should output the child render functions output', () => {
    const wrapper = shallow(
      <StatefulForm
        data={{
          test: 'init'
        }}
        onSubmit={() => {

        }}
      >
        {({valid}) => {
          return <b>{valid() ? 'testing' : 'fail this test'}</b>
        }}
      </StatefulForm>
    )

    expect(wrapper.find('b').props().children).toBe('testing')
  })

  it('should render a controlled input', () => {
    const wrapper = shallow(
      <StatefulForm
        data={{
          test: 'init'
        }}
        onSubmit={(data) => {
          expect(data.test).toBe('pass')
        }}
      >
        {({input}) => {
          return input('test', ({value, field, update, valid}) => {
            return <input value={value} name={field} onChange={(e) => update(e.target.value)} className={valid() ? 'valid' : 'invalid'} />
          })
        }}
      </StatefulForm>
    )

    const input = wrapper.find('input')

    expect(input.length).toBe(1)

    input.simulate('change', {target: {value: 'pass'}})

    wrapper.props().onSubmit()

    /** In the abcense of a validator it should always be valid */
    expect(input.props().className).toBe('valid')
  })

  it('should provide an Input and Select component', () => {
    const wrapper = mount(
      <StatefulForm
        data={{
          test: 'init',
          select: 0,
          date: ''
        }}
        onSubmit={(data) => {
          expect(data.test).toBe('pass')
          expect(data.select).toBe(1)
        }}
      >
        {({Input, Select}) => {
          return <div>
            <Input field="test" />
            <Input field="date" type="date" />
            <Select field="select" options={[
              {value: 1, label: 'One'},
              {value: 2, label: 'Two'}
            ]} />
          </div>
        }}
      </StatefulForm>
    )

    const input = wrapper.find('input')

    expect(input.length).toBe(2)

    input.first().simulate('change', {target: {value: 'pass'}})

    const select = wrapper.find('select')

    select.simulate('change', {target: {value: 1}})

    /** Unlike shallow rendering the form tag is not the root node when using `mount` */
    wrapper.find('form').props().onSubmit({} as any)
  })

  it('should support validation', () => {
    let renderCount = 0

    const wrapper = shallow(
      <StatefulForm
        data={{
          test: 'init'
        }}
        onSubmit={(data) => {
          expect(data.test).toBe('pass')
        }}
        validator={({value}) => {
          return (value === 'pass')
        }}
      >
        {({input, valid}) => {
          if(renderCount === 0){
            expect(valid()).toBe(false)
          }else{
            expect(valid()).toBe(true)
            expect(valid('test')).toBe(true)
          }

          renderCount++

          return input('test', ({value, field, update}) => {
            return <input value={value} name={field} onChange={(e) => update(e.target.value)} />
          })
        }}
      </StatefulForm>
    )

    expect(renderCount).toBe(1)
    wrapper.find('input').simulate('change', {target: {value: 'pass'}})
    expect(renderCount).toBe(2)
  })

  it('should supply a validation function for the input', () => {
    const wrapper = shallow(
      <StatefulForm
        data={{
          test: 'init'
        }}
        onSubmit={(data) => {
          expect(data.test).toBe('pass')
        }}
        validator={({value}) => {
          return (value === 'pass')
        }}
      >
        {({input}) => {
          return input('test', ({value, field, update, valid}) => {
            return <input value={value} name={field} onChange={(e) => update(e.target.value)} className={valid() ? 'valid' : 'invalid'} />
          })
        }}
      </StatefulForm>
    )

    const input = wrapper.find('input')

    expect(input.props().className).toBe('invalid')
    input.simulate('change', {target: {value: 'pass'}})
    expect(wrapper.find('input').props().className).toBe('valid')
  })

  it('should work like the readme says it does', () => {
    // This test should only fail if others before it do.

    const wrapper = shallow(<StatefulForm
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
    </StatefulForm>)

    expect(wrapper.find('input').length).toBe(3)
  })

  it('should support property injection', () => {
    shallow(<MyForm
      data={{
        test: 'init'
      }}
      onSubmit={() => {}}
    >
      {({test}) => {
        expect(test).toBe('passed')

        return <b>Test</b>
      }}
    </MyForm>)
  })
})

const MyForm = function<T>(props: FormProps<T, RenderFunction<T, {test: string}>>){
  return <StatefulForm
    data={props.data}
    onSubmit={props.onSubmit}
    validator={props.validator}
  >
    {(args: any) => {
      args.test = 'passed'

      return props.children(args)
    }}
  </StatefulForm>
}