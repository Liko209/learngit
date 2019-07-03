/*
 * @Author: isaac.liu
 * @Date: 2019-07-01 13:44:53
 * Copyright © RingCentral. All rights reserved.
 */
import { IWrapper } from './wrapper';
import { ComponentType } from 'react';

class TestApp {
  private _imp: IWrapper;

  constructor(imp: IWrapper) {
    this._imp = imp;
  }

  get leftNav() {
    return this._imp.findByAutomationID('leftPanel', true);
  }

  get aboutDialog() {
    return this._imp.findByAutomationID('about-page-dialog', true);
  }

  find(component: ComponentType) {
    return this._imp.find(component);
  }

  toString() {
    return this._imp.toString();
  }
}

export { TestApp };
