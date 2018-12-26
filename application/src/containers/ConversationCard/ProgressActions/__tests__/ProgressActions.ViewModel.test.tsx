/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { PostService, ItemService } from 'sdk/service';
import { ProgressActionsViewModel } from '../ProgressActions.ViewModel';
import { getEntity } from '../../../../store/utils';
import { Notification } from '@/containers/Notification';

jest.mock('../../../../store/utils');
jest.mock('sdk/service');
jest.mock('@/containers/Notification');

Notification.flashToast = jest.fn();

const postService = {
  reSendPost: jest.fn(),
  deletePost: jest.fn(),
};
const itemService = {
  canResendFailedItems: jest.fn().mockReturnValue(true),
};

PostService.getInstance = jest.fn().mockReturnValue(postService);
ItemService.getInstance = jest.fn().mockReturnValue(itemService);

const mockPostData = {
  id: 123,
  itemIds: [1],
};

const props = {
  id: 123,
};

let vm: ProgressActionsViewModel;

describe('ProgressActionsViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock) = jest.fn().mockReturnValue(mockPostData);
  });

  beforeEach(() => {
    vm = new ProgressActionsViewModel(props);
    jest.clearAllMocks();
  });

  describe('id', () => {
    it('should be get post id when the component is instantiated', () => {
      expect(vm.id).toEqual(props.id);
    });
  });

  // describe('post', () => {
  //   it('should be get post entity when invoke class instance property post', () => {
  //     expect(vm.post).toEqual(mockPostData);
  //   });

  //   it('should be get POST_STATUS.INPROGRESS when change post status', () => {
  //     mockPostData.status = POST_STATUS.INPROGRESS;
  //     expect(vm.post.status).toEqual(POST_STATUS.INPROGRESS);
  //   });

  //   it('should be get POST_STATUS.FAIL when change post status', () => {
  //     mockPostData.status = POST_STATUS.FAIL;
  //     expect(vm.post.status).toEqual(POST_STATUS.FAIL);
  //   });
  // });

  describe('resend()', () => {
    it('should be called on post service method when invoke it', async () => {
      await vm.resend();
      expect(postService.reSendPost).toBeCalled();
    });

    it('should not call resend when has failed items JPT-617', async () => {
      (itemService.canResendFailedItems as jest.Mock).mockReturnValueOnce(
        false,
      );
      await vm.resend();
      expect(postService.reSendPost).toBeCalledTimes(0);
      expect(Notification.flashToast).toBeCalled();
    });
  });

  describe('delete()', () => {
    it('should be called on post service method when invoke it', async () => {
      await vm.deletePost();
      expect(postService.deletePost).toBeCalled();
    });
  });
});
