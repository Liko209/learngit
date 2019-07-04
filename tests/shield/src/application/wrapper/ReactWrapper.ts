/*
 * @Author: isaac.liu
 * @Date: 2019-07-03 09:53:17
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactElement, ComponentType } from 'react';
import { Simulate } from 'react-dom/test-utils';
import TestRender, { ReactTestInstance } from 'react-test-renderer';
import { IWrapper } from './interface';

class ReactWrapper implements IWrapper<ReactTestInstance> {
  protected inst: ReactTestInstance;

  constructor(inst: ReactTestInstance) {
    this.init(inst);
  }

  init(origin: ReactTestInstance) {
    this.inst = origin;
  }

  findByAutomationID(id: string, first: boolean = true) {
    const result = this.inst.findByProps({ 'data-test-automation-id': id });
    if (first) {
      return new ReactWrapper(result[0]);
    }
    return new ReactWrapper(result);
  }

  findByProps(props: { [propName: string]: any }): IWrapper<ReactTestInstance> {
    const result = this.inst.findByProps(props);
    return new ReactWrapper(result);
  }

  // TODO
  findWhere(predicate: (wrapper: ReactTestInstance) => boolean) {
    return [] as ReactWrapper[];
  }

  find(component: ComponentType) {
    const results = this.inst.findAllByType(component);
    return results.map(item => new ReactWrapper(item));
  }

  click() {
    Simulate.click(this.inst.instance);
  }

  enter() {
    Simulate.keyPress(this.inst.instance, {
      key: 'Enter',
      keyCode: 13,
      which: 13,
    });
  }

  input(text: string) {
    // @ts-ignore
    Simulate.change(this.inst.instance, { target: { value: text } });
  }

  flush() {}

  toString() {
    return `${this.inst.type}`;
  }
}

function reactCreator(element: ReactElement): IWrapper<ReactTestInstance> {
  const render = TestRender.create(element);
  return new ReactWrapper(render.root);
}

export { ReactWrapper, reactCreator };
