/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-16 18:00:53
 * Copyright © RingCentral. All rights reserved.
 */

import { createDecorator } from 'framework/ioc';

const IMessageStore = createDecorator('IMessageStore');

interface IMessageStore {
  conversationHeaderExtensions: React.ComponentType[];
  draftMap: Map<number, string>;
  currentFocusedInput?: number;
  isRightRailOpen: boolean;
  lastGroupId?: number;
  addConversationHeaderExtension(extensions: React.ReactNode[]): void;
  savePostDraft(id: number, draft: string): void;
  removePostDraft(id: number): void;
  setIsRightRailOpen(bool: boolean): void;
  setLastGroutId(id: number): void;
}

export { IMessageStore };
