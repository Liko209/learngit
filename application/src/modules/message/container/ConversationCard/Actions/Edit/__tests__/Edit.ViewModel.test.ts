/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-12-10 14:22:49
 * Copyright © RingCentral. All rights reserved.
 */
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { EditViewModel } from '../Edit.ViewModel';
import { jupiter } from 'framework/Jupiter';
import { IMessageService, IMessageStore } from '@/modules/message/interface';
import { MessageService } from '@/modules/message/service';
import { MessageStore } from '@/modules/message/store';

jupiter.registerService(IMessageService, MessageService);
jupiter.registerService(IMessageStore, MessageStore);
const ID = 1;
let editViewModel: EditViewModel;
beforeEach(() => {
  editViewModel = new EditViewModel({ id: ID, disabled: true });
});

describe('EditViewModel', () => {
  describe('_id', () => {
    it('should return id', () => {
      expect(editViewModel._id).toBe(1);
    });
  });
  describe('disabled', () => {
    it('should return disabled', () => {
      expect(editViewModel.disabled).toBeTruthy();
    });
  });
  describe('edit()', () => {
    it('should edit success [JPT-479]', () => {
      const messageService: IMessageService = jupiter.get(IMessageService);
      jest.spyOn(messageService, 'setEditInputFocus');
      editViewModel.edit();
      expect(getGlobalValue(GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS)).toContain(ID);
      expect(messageService.setEditInputFocus).toHaveBeenCalledWith(ID);
    });
  });
});
