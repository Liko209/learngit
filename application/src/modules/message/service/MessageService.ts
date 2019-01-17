/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:16:50
 * Copyright © RingCentral. All rights reserved.
 */

import { inject } from 'framework';
import { MessageStore } from '../store';
import { MessageExtension } from '../types';

class MessageService {
  @inject(MessageStore) private _messageStore: MessageStore;

  registerExtension(extension: MessageExtension) {
    this._messageStore.addExtension(extension);
  }
}

export { MessageService };
