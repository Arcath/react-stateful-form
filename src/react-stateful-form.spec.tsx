import * as React from 'react'
import {configure, shallow, mount} from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

import {StatefulForm, RenderFunctionArguments, InjectFunction} from './react-stateful-form'

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

    wrapper.simulate('submit', {preventDefault: () => {}})

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
    wrapper.find('form').simulate('submit', {preventDefault: () => {}})
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

  it('should validate the whole form', () => {
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
          const disabled = !valid()

          return <div>
            {input('test', ({value, field, update, valid}) => {
              return <input value={value} name={field} onChange={(e) => update(e.target.value)} className={valid() ? 'valid' : 'invalid'} type="text" />
            })}
            <input type="submit" value="Submit" disabled={disabled} />
          </div>
        }}
      </StatefulForm>
    )

    const submit = wrapper.find('input[type="submit"]')
    const input = wrapper.find('input[type="text"]')

    expect(submit.props().disabled).toBe(true)
    input.simulate('change', {target: {value: 'pass'}})
    expect(wrapper.find('input[type="submit"]').props().disabled).toBe(false)
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

  it('should provide a reset function', () => {
    const wrapper = mount(
      <StatefulForm
        data={{
          test: 'init'
        }}
        onSubmit={(data, reset) => {
          expect(data.test).toBe('passed')
          reset()
        }}
      >
        {({input}) => {
          return input('test', ({value, reset, update}) => {
            return <div className="control">
              <input value={value} onChange={(e) => update(e.target.value)} />
              <button onClick={() => reset()}>Reset</button>
            </div>
          })
        }}
      </StatefulForm>
    )

    const input = wrapper.find('input')
    input.simulate('change', {target: {value: 'passed'}})

    expect((input.instance() as any).value).toBe('passed')

    const button = wrapper.find('button')
    button.simulate('click')

    expect((input.instance() as any).value).toBe('init')

    input.simulate('change', {target: {value: 'passed'}})

    wrapper.find('form').simulate('submit')

    expect((input.instance() as any).value).toBe('init')
  })

  it('should support prop injection', () => {
    const data = {
      test: 'init'
    }

    const injectable = function<T>({}: RenderFunctionArguments<T>){
      return {
        test: true
      }
    }

    mount(
      <StatefulForm data={data} onSubmit={() => {}} injectable={injectable as InjectFunction<any, {test: boolean}>}>
        {({inject}) => {
          const {test} = inject()

          expect(test).toBe(true)

          return <b>test passed</b>
        }}
      </StatefulForm>
    )
  })
})