/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:03:39
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */

import { ReactNode } from 'react';
import { observable } from 'mobx';

class MessageStore {
  @observable conversationHeaderExtensions: ReactNode[] = [];
  @observable draftMap: Map<number, string> = new Map();
  @observable currentFocusedInput?: number;
  addConversationHeaderExtension(extension: ReactNode) {
    this.conversationHeaderExtensions.push(extension);
  }
  savePostDraft(id: number, draft: string) {
    this.draftMap.set(id, draft);
  }

  removePostDraft(id: number) {
    this.draftMap.delete(id);
  }
}

export { MessageStore };
