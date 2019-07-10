/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-23 10:28:53
 * Copyright © RingCentral. All rights reserved.
 */

import * as goToConversation from '@/common/goToConversation';
import { NewMessageViewModel } from '../NewMessage.ViewModel';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { GroupService } from 'sdk/module/group';
import { GlipTypeUtil } from 'sdk/utils';
import { PostService } from 'sdk/module/post';

jest.mock('sdk/module/post');
jest.mock('../../Notification');
jest.mock('@/common/goToConversation');
jest.mock('sdk/module/group');
const groupService = new GroupService();
const postService = new PostService();
jest.spyOn(ServiceLoader, 'getInstance').mockImplementation((config) => {
  if (config === ServiceConfig.GROUP_SERVICE) {
    return groupService;
  } else if (config === ServiceConfig.POST_SERVICE) {
    return postService;
  }
})

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

  describe('newMessage()', () => {
    it('should send direct message when isDirectMessage is true', async () => {
      const persons = [1, 2, 3]
      const groups = [4, 5]
      newMessageVM.isDirectMessage = true;
      newMessageVM.members = [...persons, ...groups];
      GlipTypeUtil.isExpectedType = jest.fn().mockImplementation((id) => persons.includes(id));
      goToConversation.getConversationId = jest.fn().mockImplementation((id) => id);
      postService.sendPost = jest.fn();
      await newMessageVM.newMessage('test');
      expect(postService.sendPost).toBeCalledTimes(5);
      expect(goToConversation.goToConversation).toBeCalledWith({ "conversationId": 1 });
    })
  })
});
