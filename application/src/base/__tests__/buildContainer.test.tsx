/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:26
 * Copyright © RingCentral. All rights reserved.
 */
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
const mockOnReceiveProps = jest.fn().mockName('onReceiveProps');
const dispose = jest.fn().mockName('dispose');
class MyViewModel extends AbstractViewModel implements MyViewProps {
  dispose = dispose;

  @observable
  id: number;
  @observable
  text: string;

  onReceiveProps(props: MyViewModelProps) {
    mockOnReceiveProps(props);
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

  it('should call onReceiveProps() of ViewModel when props change', () => {
    const wrapper = mount(<MyContainer id={1} />);
    expect(mockOnReceiveProps).toHaveBeenCalledWith({ id: 1 });

    wrapper.setProps({ id: 2 });
    expect(mockOnReceiveProps).toHaveBeenCalledWith({ id: 2 });
  });

  it('should call dispose() of ViewModel when unmount', () => {
    const wrapper = mount(<MyContainer id={1} />);

    wrapper.unmount();

    expect(dispose).toHaveBeenCalled();
  });
});
