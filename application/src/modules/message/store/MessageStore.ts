/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:03:39
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactNode } from 'react';
import { observable } from 'mobx';
class MessageStore {
  @observable conversationHeaderExtensions: ReactNode[] = [];

  addConversationHeaderExtension(extension: ReactNode) {
    this.conversationHeaderExtensions.push(extension);
  }
}

export { MessageStore };
