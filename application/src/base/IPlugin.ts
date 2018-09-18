/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:07:12
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { IViewModel } from './IViewModel';

interface IPlugin {
  install(vm: IViewModel): void;
  wrapView(View: ComponentType<any>): ComponentType<any>;
}

export { IPlugin };
