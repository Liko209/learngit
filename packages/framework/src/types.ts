/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 14:47:08
 * Copyright © RingCentral. All rights reserved.
 */

import { interfaces } from './ioc';
import { AbstractModule } from './AbstractModule';

type ModuleConfig = {
  entry?: interfaces.Newable<AbstractModule>;
  provides?: {
    [key: string]: interfaces.Newable<any>;
  };
};

export { ModuleConfig };
