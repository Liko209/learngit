/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:16:50
 * Copyright © RingCentral. All rights reserved.
 */

import { ReactNode } from 'react';
import portalManager from '@/common/PortalManager';
import { EditProfile } from '../container/ProfileEdit';
import { IMessageService, IMessageStore } from '../interface';

const ROUTE_ROOT_PATH = '/messages';

class MessageService implements IMessageService {
  @IMessageStore private _messageStore: IMessageStore;

  registerConversationHeaderExtension(extensions: ReactNode[]) {
    this._messageStore.addConversationHeaderExtension(extensions);
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

  setEditInputFocus = (id: number) => {
    this._messageStore.currentFocusedInput = undefined;
    window.requestAnimationFrame(
      () => (this._messageStore.currentFocusedInput = id),
    );
  };

  open = (uid: number) => {
    portalManager.dismissLast();
    EditProfile.show({ id: uid });
  };

  blurEditInputFocus() {
    this._messageStore.currentFocusedInput = undefined;
  }

  getCurrentInputFocus() {
    return this._messageStore.currentFocusedInput;
  }

  setLastGroutId(id: number) {
    this._messageStore.setLastGroutId(id);
  }

  getNavUrl() {
    return this._messageStore.lastGroupId
      ? `${ROUTE_ROOT_PATH}/${this._messageStore.lastGroupId}`
      : ROUTE_ROOT_PATH;
  }
}

export { MessageService };
