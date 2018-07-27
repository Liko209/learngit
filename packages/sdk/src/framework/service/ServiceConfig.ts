/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 15:40:16
 * Copyright © RingCentral. All rights reserved
*/
import { IService } from './IService';

interface ServiceConfig {
  accounts: string[];
  service: string;
  serviceCreator: () => IService;
}

export { ServiceConfig };
