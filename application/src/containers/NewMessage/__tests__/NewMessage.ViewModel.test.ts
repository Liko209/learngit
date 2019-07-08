/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-23 10:28:53
 * Copyright © RingCentral. All rights reserved.
 */

import * as goToConversation from '@/common/goToConversation';
import { NewMessageViewModel } from '../NewMessage.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { GroupService } from 'sdk/module/group';

jest.mock('sdk/module/post');
jest.mock('../../Notification');
jest.mock('@/common/goToConversation');
jest.mock('sdk/module/group');
const groupService = new GroupService();
jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue(groupService);

const newMessageVM = new NewMessageViewModel();

describe('NewMessageVM', () => {
  it('new message success', async () => {
    newMessageVM.isDirectMessage = false;
    groupService.getPersonIdsBySelectedItem = jest.fn().mockReturnValue([]);
    jest
      .spyOn(goToConversation, 'goToConversation')
      .mockImplementation(() => 112);
    const message = 'test';
    newMessageVM.members = [1, 2];
    await newMessageVM.newMessage(message);
    expect(goToConversation.goToConversationWithLoading).toHaveBeenCalled();
  });
});
