/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-23 10:28:53
 * Copyright © RingCentral. All rights reserved.
 */

import * as goToConversation from '@/common/goToConversation';
import { NewMessageViewModel } from '../NewMessage.ViewModel';
import { PostService } from 'sdk/module/post';

jest.mock('sdk/module/post');
jest.mock('../../Notification');
jest.mock('../../../store/utils');
jest.mock('../../../store/index');
jest.mock('@/common/goToConversation');

const postService = new PostService();
PostService.getInstance = jest.fn().mockReturnValue(postService);

const newMessageVM = new NewMessageViewModel();

describe('NewMessageVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
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
    expect(goToConversation.goToConversationWithLoading).toHaveBeenCalled();
  });
});
