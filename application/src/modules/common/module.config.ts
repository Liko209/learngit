/*
 * @Author: Andy Hu(andy.hu@ringcentral.com)
 * @Date: 2019-03-04 16:12:23
 * Copyright Â© RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import { CommonModule } from './CommonModule';
import { ClientService } from './service';
import { CLIENT_SERVICE } from './interface';

const config: ModuleConfig = {
  entry: CommonModule,
  provides: [
    {
      name: CLIENT_SERVICE,
      value: ClientService,
    },
  ],
};

export { config };
