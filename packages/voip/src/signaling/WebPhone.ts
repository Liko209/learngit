/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-24 15:39:59
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';

class WebPhone extends EventEmitter2 {
  constructor(provisionData: any, options: any) {
    super();
    this.emit('registered');
  }

  public register(options?: any): any {
    if (options) {
      this.emit('registered');
    } else {
      this.emit('registrationFailed', 'response', 500);
    }
  }

  public invite(phoneNumber: string, options: any): any {
    return 'session';
  }
}

export { WebPhone };
