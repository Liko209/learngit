/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:16:50
 * Copyright © RingCentral. All rights reserved.
 */

import { ReactNode } from 'react';
import { inject } from 'framework';
import { MessageStore } from '../store';
import debounce from 'lodash/debounce';

class MessageService {
  @inject(MessageStore) private _messageStore: MessageStore;

  registerConversationHeaderExtension(extension: ReactNode) {
    this._messageStore.addConversationHeaderExtension(extension);
  }
  enterEditMode(id: number, draft: string) {
    this._messageStore.savePostDraft(id, draft);
  }
  leaveEditMode(id: number) {
    this._messageStore.removePostDraft(id);
  }

  getDraft(id: number) {
    return this._messageStore.draftMap.get(id) || '';
  }

  setEditInputFocus = debounce((id: number) => {
    this._messageStore.currentFocusedInput = id;
  },                           200);

  blurEditInputFocus() {
    this._messageStore.currentFocusedInput = undefined;
  }
  getCurrentInputFocus() {
    return this._messageStore.currentFocusedInput;
  }
}

export { MessageService };
