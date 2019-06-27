/*
 * @Author: isaac.liu
 * @Date: 2019-06-27 08:34:14
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule, ModuleConfig } from 'framework';

type IDummyService = {};

class DummyModule extends AbstractModule {
  async bootstrap() {
    // TODO
  }

  async dispose() {
    // TODO
  }
}

function createDummyModule(forceNew = false) {
  if (!forceNew) {
    return DummyModule;
  }

  return class extends AbstractModule {
    async bootstrap() {
      // TODO
    }

    async dispose() {
      // TODO
    }
  };
}

function createDummyConfig(provide: any, forceNew = false): ModuleConfig {
  return {
    entry: createDummyModule(forceNew),
    provides: [provide],
  };
}

export { IDummyService, createDummyModule, createDummyConfig };
