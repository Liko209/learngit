/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-16 16:39:02
 * Copyright © RingCentral. All rights reserved.
 */ import { createDecorator } from 'framework/ioc';

const IMessageService = createDecorator('IMessageService');

interface IMessageService {
  setEditInputFocus(id: number): void;
  enterEditMode(id: number, draft: string): void;
  leaveEditMode(id: number): void;
  getDraft(id: number): string;
  open(uid: number): void;
  blurEditInputFocus(): void;
  getCurrentInputFocus(): number | undefined;
  getNavUrl(): string;
  setLastGroutId(id: number): void;
}

export { IMessageService };
