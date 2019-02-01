/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-23 10:28:53
 * Copyright © RingCentral. All rights reserved.
 */

import * as goToConversation from '@/common/goToConversation';
import { service } from 'sdk';
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
  });

  it('new message success', async () => {
    jest
      .spyOn(goToConversation, 'goToConversation')
      .mockImplementation(() => 112);
    const message = 'test';
    newMessageVM.members = [1, 2];
    await newMessageVM.newMessage(message);
    expect(goToConversation.goToConversation).toHaveBeenCalled();
  });
});
