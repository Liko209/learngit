/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 12:36:13
 * Copyright © RingCentral. All rights reserved.
 */
import { ElectronModule } from './ElectronModule';
import { ElectronService } from './service';

const config = {
  entry: ElectronModule,
  provides: [ElectronService],
};

export { config };
