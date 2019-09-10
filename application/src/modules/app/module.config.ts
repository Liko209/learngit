/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 09:57:41
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import { AppModule } from './AppModule';
import { AppStore } from './store';

const config: ModuleConfig = {
  entry: AppModule,
  provides: [AppStore],
};

export { config };
