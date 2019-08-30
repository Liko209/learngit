/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:03:39
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { observable, action } from 'mobx';
import { IMessageStore } from '../interface';

class MessageStore implements IMessageStore {
  @observable conversationHeaderExtensions: ComponentType[] = [];
  @observable draftMap: Map<number, string> = new Map();
  @observable currentFocusedInput?: number;
  @observable isRightRailOpen: boolean = true;
  lastGroupId?: number;

  addConversationHeaderExtension(extensions: ComponentType[]) {
    this.conversationHeaderExtensions = this.conversationHeaderExtensions.concat(
      extensions,
    );
  }

  savePostDraft(id: number, draft: string) {
    this.draftMap.set(id, draft);
  }

  removePostDraft(id: number) {
    this.draftMap.delete(id);
  }

  setLastGroutId(id: number) {
    this.lastGroupId = id;
  }

  @action
  setIsRightRailOpen(bool: boolean) {
    this.isRightRailOpen = bool;
  }
}

export { MessageStore };
