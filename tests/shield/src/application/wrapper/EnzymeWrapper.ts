/*
 * @Author: isaac.liu
 * @Date: 2019-07-03 09:47:58
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactElement, ComponentType } from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { IWrapper } from './interface';

class EnzymeWrapper implements IWrapper {
  protected wrapper: ReactWrapper;

  constructor(wrapper: ReactWrapper) {
    this.init(wrapper);
  }

  init(origin: any) {
    this.wrapper = origin;
  }

  findByAutomationID(id: string, first: boolean = false) {
    const result = this.wrapper.find({ 'data-test-automation-id': id });
    if (first) {
      return new EnzymeWrapper(result.first());
    }
    return new EnzymeWrapper(result);
  }

  find(component: ComponentType) {
    const result = this.wrapper.find(component);
    return [new EnzymeWrapper(result)];
  }

  click() {
    this.wrapper.simulate('click');
  }

  enter() {
    this.wrapper.simulate('keypress', { key: 'Enter' });
  }

  input(text: string) {
    this.wrapper.simulate('change', { target: { value: text } });
  }

  flush() {
    this.wrapper.update();
  }

  toString() {
    return this.wrapper.debug();
  }
}

function enzymeCreator(element: ReactElement): IWrapper {
  return new EnzymeWrapper(mount(element));
}

export { EnzymeWrapper, enzymeCreator };
