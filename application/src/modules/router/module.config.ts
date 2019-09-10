/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-17 18:00:55
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import { RouterStore } from './store';
import { RouterService } from './service';
import { RouterModule } from './RouterModule';

const config: ModuleConfig = {
  entry: RouterModule,
  provides: [RouterStore, RouterService],
};

export { config };
