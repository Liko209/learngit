/*
 * @Author: isaac.liu
 * @Date: 2019-07-01 13:45:26
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactWrapper } from 'enzyme';

class Wrapper {
  protected wrapper: ReactWrapper;

  constructor(wrapper: ReactWrapper) {
    this.wrapper = wrapper;
  }

  findByAutomationID(id: string, first: boolean = false) {
    const result = this.wrapper.find({ 'data-test-automation-id': id });
    if (first) {
      return result.first();
    }
    return result;
  }

  update() {
    this.wrapper.update();
  }

  unmount() {
    this.wrapper.unmount();
  }
}

export { Wrapper };
