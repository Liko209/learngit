/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-16 16:39:02
 * Copyright © RingCentral. All rights reserved.
 */ import { createDecorator } from 'framework';

const IMessageService = createDecorator('IMessageService');

interface IMessageService {
  setEditInputFocus(id: number): void;
  enterEditMode(id: number, draft: string): void;
  leaveEditMode(id: number): void;
  getDraft(id: number): void;
  blurEditInputFocus(): void;
  getCurrentInputFocus(): number | undefined;
}

export { IMessageService };
