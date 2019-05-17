/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 14:47:08
 * Copyright © RingCentral. All rights reserved.
 */

import { interfaces } from './ioc';
import { AbstractModule } from './AbstractModule';
import { Jupiter } from './Jupiter';

type Provide<T> =
  | {
      name: string | interfaces.Newable<T>;
      value: interfaces.Newable<T>;
    }
  | interfaces.Newable<T>;

type ModuleConfig = {
  entry?: interfaces.Newable<AbstractModule>;
  binding?: (jupiter: Jupiter) => void;
};

export { Provide, ModuleConfig };
