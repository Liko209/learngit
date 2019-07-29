/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:03:39
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */

import { ReactNode } from 'react';
import { observable, action } from 'mobx';
import { IMessageStore } from '../interface';

class MessageStore implements IMessageStore {
  @observable conversationHeaderExtensions: ReactNode[] = [];
  @observable draftMap: Map<number, string> = new Map();
  @observable currentFocusedInput?: number;
  @observable isRightRailOpen: boolean = true;

  addConversationHeaderExtension(extension: ReactNode) {
    this.conversationHeaderExtensions.push(extension);
  }

  savePostDraft(id: number, draft: string) {
    this.draftMap.set(id, draft);
  }

  removePostDraft(id: number) {
    this.draftMap.delete(id);
  }

  @action
  setIsRightRailOpen(bool: boolean) {
    this.isRightRailOpen = bool;
  }
}

export { MessageStore };
