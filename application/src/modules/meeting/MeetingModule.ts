/*
 * @Author: cooper.ruan
 * @Date: 2019-07-30 14:36:07
 * Copyright © RingCentral. All rights reserved.
 */

import { Jupiter } from 'framework/Jupiter';
import { inject } from 'framework/ioc';
import { AbstractModule } from 'framework/AbstractModule';
import { MEETING_SERVICE } from './interface/constant';

class MeetingModule extends AbstractModule {
  static TAG: string = '[UI MeetingModule] ';

  @inject(Jupiter) _jupiter: Jupiter;

  async bootstrap() {
    this._jupiter.emitModuleInitial(MEETING_SERVICE);
  }

  dispose() {}
}

export { MeetingModule };
