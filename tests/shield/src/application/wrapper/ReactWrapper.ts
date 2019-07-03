/*
 * @Author: isaac.liu
 * @Date: 2019-07-03 09:53:17
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactElement } from 'react';
import TestRender, { ReactTestInstance } from 'react-test-renderer';
import { IWrapper } from './interface';

class ReactWrapper implements IWrapper {
  protected inst: ReactTestInstance;

  constructor(inst: ReactTestInstance) {
    this.init(inst);
  }

  init(origin: any) {
    this.inst = origin;
  }

  findByAutomationID(id: string, first: boolean) {
    const result = this.inst.findByProps({ 'data-test-automation-id': id });
    if (first) {
      return new ReactWrapper(result[0]);
    }
    return new ReactWrapper(result);
  }

  toString() {
    return `${this.inst.type}`;
  }
}

function reactCreator(element: ReactElement): IWrapper {
  const render = TestRender.create(element);
  return new ReactWrapper(render.root);
}

export { ReactWrapper, reactCreator };
