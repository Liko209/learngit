/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 12:36:13
 * Copyright © RingCentral. All rights reserved.
 */
import { HomeService } from './service';
import { HomeStore } from './store';
import { HomeModule } from './HomeModule';

const config = {
  entry: HomeModule,
  provides: [HomeStore, HomeService],
};

export { config };
