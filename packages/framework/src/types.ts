/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 14:47:08
 * Copyright © RingCentral. All rights reserved.
 */

import { interfaces } from './ioc';
import { AbstractModule } from './AbstractModule';

type Provide<T> =
  | {
    name: interfaces.ServiceIdentifier<T>;
    value: interfaces.Newable<T>;
  }
  | interfaces.Newable<T>;

type ModuleConfig = {
  entry?: interfaces.Newable<AbstractModule>;
  provides?: Provide<any>[];
  binding?: (jupiter: any) => void;
};

export { Provide, ModuleConfig };
