/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-23 10:28:53
 * Copyright © RingCentral. All rights reserved.
 */

import * as goToConversation from '@/common/goToConversation';
import { NewMessageViewModel } from '../NewMessage.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('sdk/module/post');
jest.mock('../../Notification');
jest.mock('@/common/goToConversation');

jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({});

const newMessageVM = new NewMessageViewModel();

describe('NewMessageVM', () => {
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
