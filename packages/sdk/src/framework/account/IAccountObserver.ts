/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-06-27 14:11:21
 * Copyright © RingCentral. All rights reserved
*/

interface IAccountObserver {
  onAuthChange(accountType: string, success: boolean): void;
  onSupportedServiceChange(services: string[], start: boolean): void;
}

export { IAccountObserver };
