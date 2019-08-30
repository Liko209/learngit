/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-23 09:41:54
 * Copyright © RingCentral. All rights reserved.
 */
import * as service from './service';
import * as dao from './dao';
import * as utils from './utils';
import * as api from './api';
import * as error from './error';
import './module/debug';
import Sdk from './Sdk';
import { container } from './container';
import { registerConfigs } from './registerConfigs';
import { Container } from 'foundation/ioc';

export * from './framework';
export {
  default as GlipTypeDictionary,
} from './utils/glip-type-dictionary/types';
export { LogControlManager } from './module/log';

class ContainerRegister {
  static hasRegister: boolean = false;
  static registerAll(c: Container) {
    if (!ContainerRegister.hasRegister) {
      registerConfigs.classes.forEach(config => c.registerClass(config));
      // registerConfigs.asyncClasses.forEach(config => container.registerAsyncClass(config));
      registerConfigs.constants.forEach(config =>
        c.registerConstantValue(config),
      );
      ContainerRegister.hasRegister = true;
    }
  }
}

ContainerRegister.registerAll(container);

const sdk: Sdk = container.get(Sdk.name);

export { sdk, service, utils, dao, api, error };
