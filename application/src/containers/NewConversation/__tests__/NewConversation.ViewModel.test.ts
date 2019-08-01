/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-07-23 13:21:22
 * Copyright © RingCentral. All rights reserved.
 */

import { NewConversationViewModel } from '../NewConversation.ViewModel';
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
import { Notification } from '@/containers/Notification';
import { getConversationId } from '@/common/goToConversation';

jest.mock('@/containers/Notification');
jest.mock('@/common/goToConversation');

let newConversationVM: NewConversationViewModel;
describe('NewConversationViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    newConversationVM = new NewConversationViewModel();
    jest.spyOn(newConversationVM, 'handleClose');
  });
  describe('disabledOkBtn', () => {
    it('should be true when members length is 0 [JPT-2629]', () => {
      newConversationVM.members = [];
      expect(newConversationVM.disabledOkBtn).toBeTruthy();
    });
  });
  describe('handleSearchContactChange()', () => {
    it('should update members when being called', () => {
      expect(newConversationVM.members).toHaveLength(0);
      newConversationVM.handleSearchContactChange([{ id: 1 }, { id: 2 }]);
      expect(newConversationVM.members).toHaveLength(2);
    });
  });
  describe('createNewConversation()', () => {
    it('should call handleClose when getConversationId success', async () => {
      (getConversationId = jest.fn().mockImplementation(() => {
        return 1;
      })),
        await newConversationVM.createNewConversation();
      expect(newConversationVM.handleClose).toHaveBeenCalled();
    });
    it('Should display flash toast notification when getConversationId failed for server issue [JPT-2605]', async () => {
      (getConversationId = jest.fn().mockImplementation(() => {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
      })),
        await newConversationVM.createNewConversation();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.newConversationBackendError',
        }),
      );
      expect(newConversationVM.handleClose).not.toHaveBeenCalled();
    });
    it('Should display flash toast notification when getConversationId failed for network issue [JPT-2605, JPT-2606]', async () => {
      (getConversationId = jest.fn().mockImplementation(() => {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
      })),
        await newConversationVM.createNewConversation();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.newConversationNetworkError',
        }),
      );
      expect(newConversationVM.handleClose).not.toHaveBeenCalled();
    });
  });
});
