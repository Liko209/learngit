/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 12:36:13
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import { HomeService } from './service';
import { HomeStore } from './store';
import { HomeModule } from './HomeModule';
import { IHomeService } from './interface/IHomeService';

const config: ModuleConfig = {
  entry: HomeModule,
  provides: [HomeStore, { name: IHomeService, value: HomeService }],
};

export { config };
