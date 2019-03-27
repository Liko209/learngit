/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 09:57:41
 * Copyright © RingCentral. All rights reserved.
 */
import { AppModule } from './AppModule';
import { AppStore } from './store';

const config = {
  entry: AppModule,
  provides: [AppStore],
};

export { config };
