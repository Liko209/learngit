/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-04 12:15:21
 * Copyright © RingCentral. All rights reserved.
 */
import { IModule } from './IModule';
import { injectable } from './ioc';

@injectable()
abstract class AbstractModule implements IModule {
  abstract bootstrap(): void | Promise<void>;
  dispose?(): void | Promise<void>;
}

export { AbstractModule };
