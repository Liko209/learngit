/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 09:57:41
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig, Jupiter } from 'framework';
import { AppModule } from './AppModule';
import { AppStore } from './store';

const config: ModuleConfig = {
  entry: AppModule,
  binding(jupiter: Jupiter) {
    jupiter.registerClass(AppStore);
  },
};

export { config };
