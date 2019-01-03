/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-23 10:28:53
 * Copyright © RingCentral. All rights reserved.
 */

import * as goToConversation from '@/common/goToConversation';
import { service } from 'sdk';
import { getGlobalValue } from '../../../store/utils';
import storeManager from '../../../store/index';
import { NewMessageViewModel } from '../NewMessage.ViewModel';
jest.mock('../../Notification');
jest.mock('../../../store/utils');
jest.mock('../../../store/index');
jest.mock('@/common/goToConversation');

const { PostService } = service;

const postService = {
  sendPost() {},
};

const newMessageVM = new NewMessageViewModel();

describe('NewMessageVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    jest.spyOn(PostService, 'getInstance').mockReturnValue(postService);
    const gs = {
      get: jest.fn(),
      set: jest.fn(),
    };
    jest.spyOn(storeManager, 'getGlobalStore').mockReturnValue(gs);
  });

  it('new message success', async () => {
    // postService.sendPost = jest.fn().mockImplementation(() => ok({}));
    jest
      .spyOn(goToConversation, 'goToConversation')
      .mockImplementation(() => 112);
    const message = 'test';
    newMessageVM.members = [1, 2];
    await newMessageVM.newMessage(message);
    expect(goToConversation.goToConversation).toHaveBeenCalledWith({
      message,
      memberIds: [1, 2],
    });
  });

  it('isOpen', () => {
    (getGlobalValue as jest.Mock).mockReturnValue(undefined);
    expect(newMessageVM.isOpen).toBe(false);
    (getGlobalValue as jest.Mock).mockReturnValue(true);
    expect(newMessageVM.isOpen).toBe(true);
  });

  it('inputReset', () => {
    newMessageVM.inputReset();
    expect(newMessageVM.emailErrorMsg).toBe('');
    expect(newMessageVM.disabledOkBtn).toBe(true);
    expect(newMessageVM.emailError).toBe(false);
    expect(newMessageVM.serverError).toBe(false);
  });
});
