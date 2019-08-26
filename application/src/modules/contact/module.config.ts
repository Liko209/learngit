/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-21 19:55:55
 * Copyright © RingCentral. All rights reserved.
 */

import { ContactModule } from './ContactModule';
import { ContactService } from './service';
import { ContactStore } from './store';
import { IContactService, IContactStore } from './interface';

const config = {
  entry: ContactModule,
  provides: [
    {
      name: IContactService,
      value: ContactService,
    },
    {
      name: IContactStore,
      value: ContactStore,
    },
  ],
};

export { config };
