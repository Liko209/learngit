/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 16:42:50
 * Copyright © RingCentral. All rights reserved
*/

import { IAccount } from './IAccount';
import { IAccountObserver } from './IAccountObserver';

interface IAccountConfig {
  type: string;
  accountCreator: (type: string, accountObserver: IAccountObserver) => IAccount;
}

export { IAccountConfig };
