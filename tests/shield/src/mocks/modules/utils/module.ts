/*
 * @Author: isaac.liu
 * @Date: 2019-06-27 08:34:14
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule, ModuleConfig } from 'framework';

type IDummyService = {};

function createDummyModule() {
  return class extends AbstractModule {
    async bootstrap() {
      // TODO
    }

    async dispose() {
      // TODO
    }
  };
}

function createDummyConfig(provide: any): ModuleConfig {
  return {
    entry: createDummyModule(),
    provides: Array.isArray(provide) ? provide : [provide],
  };
}

export { IDummyService, createDummyModule, createDummyConfig };
