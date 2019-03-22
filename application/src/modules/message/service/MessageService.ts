/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:16:50
 * Copyright © RingCentral. All rights reserved.
 */

import { ReactNode } from 'react';
import { inject } from 'framework';
import { MessageStore } from '../store';

class MessageService {
  @inject(MessageStore) private _messageStore: MessageStore;

  registerConversationHeaderExtension(extension: ReactNode) {
    this._messageStore.addConversationHeaderExtension(extension);
  }
}

export { MessageService };
