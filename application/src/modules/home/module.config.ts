/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 12:36:13
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig, Jupiter } from 'framework';
import { HomeService } from './service';
import { HomeStore } from './store';
import { HomeModule } from './HomeModule';

const config: ModuleConfig = {
  entry: HomeModule,
  binding: (jupiter: Jupiter) => {
    jupiter.registerClass(HomeStore);
    jupiter.registerClass(HomeService);
  },
};

export { config };
