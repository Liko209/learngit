import React from 'react';
import { observable } from 'mobx';
import { mount } from 'enzyme';
import { AbstractViewModel } from '@/base/AbstractViewModel';
import { buildContainer } from '../buildContainer';

type MyViewModelProps = {
  id: number;
};
type MyViewProps = {
  id: number;
  text: string;
};
const BadChild = () => <div />;
const MyView = ({ id, text }: MyViewProps) => (
  <div>
    {text} {id}
    <BadChild />
  </div>
);
const componentDidMount = jest.fn().mockName('componentDidMount');
const componentWillUnmount = jest.fn().mockName('componentWillUnmount');
const componentDidUpdate = jest.fn().mockName('componentDidUpdate');
const componentDidCatch = jest.fn().mockName('componentDidCatch');
class MyViewModel extends AbstractViewModel implements MyViewProps {
  componentDidMount = componentDidMount;
  componentWillUnmount = componentWillUnmount;
  componentDidUpdate = componentDidUpdate;
  componentDidCatch = componentDidCatch;

  @observable
  id: number;
  @observable
  text: string;

  constructor(props: MyViewModelProps) {
    super();
    if (isNaN(props.id)) throw new Error();
    this.id = props.id;
    this.text = 'text';
  }
}

describe('buildContainer()', () => {
  const MyContainer = buildContainer<MyViewModelProps>({
    View: MyView,
    ViewModel: MyViewModel,
  });

  it('should build a container', () => {
    const wrapper1 = mount(<MyContainer id={1} />);
    expect(wrapper1.text()).toBe('text 1');

    const wrapper2 = mount(<MyContainer id={2} />);
    expect(wrapper2.text()).toBe('text 2');
  });

  it('should invoke lifecycle of ViewModel', () => {
    const wrapper = mount(<MyContainer id={1} />);
    expect(componentDidMount).toHaveBeenCalled();

    wrapper.setProps({ id: 2 });
    expect(componentDidUpdate).toHaveBeenCalled();

    wrapper.unmount();
    expect(componentWillUnmount).toHaveBeenCalled();

    // TODO test componentDidCatch
    // expect(componentDidCatch).toHaveBeenCalled();
  });
});
