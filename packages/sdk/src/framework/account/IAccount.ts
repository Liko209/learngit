/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 14:01:16
 * Copyright © RingCentral. All rights reserved
*/

interface IAccount {
  updateSupportedServices(data: any): Promise<void>;
  getSupportedServices(): string[];
  on(event: string, callback: Function): void;
}

export { IAccount };
