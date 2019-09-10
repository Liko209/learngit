/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-01 23:14:11
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractModule } from 'framework/AbstractModule';
import { inject } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { PHONE_SERVICE } from './interface/constant';

class PhoneModule extends AbstractModule {
  static TAG: string = '[UI PhoneModule] ';

  @inject(Jupiter) _jupiter: Jupiter;

  async bootstrap() {
    this._jupiter.emitModuleInitial(PHONE_SERVICE);
  }

  dispose() {}
}

export { PhoneModule };
