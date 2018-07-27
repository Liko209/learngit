/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 13:45:15
 * Copyright © RingCentral. All rights reserved
*/

interface IService {
  isStarted(): boolean;
  start(): void;
  stop(): void;
}

export { IService };
