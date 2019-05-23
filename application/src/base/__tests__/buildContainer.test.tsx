/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:26
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observable } from 'mobx';
import { mount, shallow } from 'enzyme';
import { StoreViewModel } from '@/store/ViewModel';
import { buildContainer } from '../buildContainer';

type MyProps = {
  id: number;
};

type MyViewProps = MyProps & {
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
class MyViewModel extends StoreViewModel<MyProps> {
  dispose = dispose;

  @observable text: string;

  onReceiveProps(props: MyProps) {
    mockOnReceiveProps(props);
    if (isNaN(props.id)) throw new Error();
    this.text = 'text';
  }
}

class ConflictViewModel extends StoreViewModel<MyProps> {
  dispose = dispose;

  @observable id: number;
  @observable text: string;
}

describe('buildContainer()', () => {
  it('should build a container', () => {
    const MyContainer = buildContainer<MyProps>({
      View: MyView,
      ViewModel: MyViewModel,
    });

    const wrapper1 = mount(<MyContainer id={1} />);
    expect(wrapper1.text()).toBe('text 1');

    const wrapper2 = mount(<MyContainer id={2} />);
    expect(wrapper2.text()).toBe('text 2');
  });

  it('should call onReceiveProps() of ViewModel when props change', () => {
    const MyContainer = buildContainer<MyProps>({
      View: MyView,
      ViewModel: MyViewModel,
    });

    const wrapper = mount(<MyContainer id={1} />);
    expect(mockOnReceiveProps).toHaveBeenCalledWith({ id: 1 });

    wrapper.setProps({ id: 2 });
    expect(mockOnReceiveProps).toHaveBeenCalledWith({ id: 2 });
  });

  it('should call dispose() of ViewModel when unmount', () => {
    const MyContainer = buildContainer<MyProps>({
      View: MyView,
      ViewModel: MyViewModel,
    });

    const wrapper = mount(<MyContainer id={1} />);

    wrapper.unmount();

    expect(dispose).toHaveBeenCalled();
  });

  it('should throw error when Container props conflict with ViewModel', () => {
    const ConflictContainer = buildContainer<MyProps>({
      View: MyView,
      ViewModel: ConflictViewModel,
    });

    expect(() => shallow(<ConflictContainer id={1} />)).toThrow();
  });
});
