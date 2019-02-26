/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { PostService } from 'sdk/module/post';
import { ProgressActionsViewModel } from '../ProgressActions.ViewModel';
import { getEntity } from '../../../../store/utils';
import { Notification } from '@/containers/Notification';
import { PROGRESS_STATUS } from 'sdk/module/progress';
import { ItemService } from 'sdk/module/item';

jest.mock('../../../../store/utils');
jest.mock('sdk/module/post');
jest.mock('sdk/module/item');
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
  id: -123,
  progressStatus: PROGRESS_STATUS.FAIL,
  itemIds: [1],
};

const nprops = {
  id: -123,
};

const pprops = {
  id: 123,
};

let nvm: ProgressActionsViewModel;
let pvm: ProgressActionsViewModel;

describe('ProgressActionsViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock) = jest.fn().mockReturnValue(mockPostData);
  });

  beforeEach(() => {
    nvm = new ProgressActionsViewModel(nprops);
    pvm = new ProgressActionsViewModel(pprops);
    jest.clearAllMocks();
  });

  describe('id', () => {
    it('should be get post id when the component is instantiated', () => {
      expect(nvm.id).toEqual(nprops.id);
    });
  });

  describe('post', () => {
    it('should be get post entity when invoke class instance property post', () => {
      expect(nvm.post).toEqual(mockPostData);
    });

    it('should be get post status from cache when postId < 0', () => {
      expect(nvm.postProgress).toEqual(PROGRESS_STATUS.FAIL);
    });

    it('should be get PROGRESS_STATUS.SUCCESS when postId > 0', () => {
      expect(pvm.postProgress).toEqual(PROGRESS_STATUS.SUCCESS);
    });
  });

  describe('resend()', () => {
    it('should be called on post service method when invoke it', async () => {
      await nvm.resend();
      expect(postService.reSendPost).toBeCalled();
    });

    it('should not call resend when has failed items JPT-617', async () => {
      (itemService.canResendFailedItems as jest.Mock).mockReturnValueOnce(
        false,
      );
      await nvm.resend();
      expect(postService.reSendPost).toBeCalledTimes(0);
      expect(Notification.flashToast).toBeCalled();
    });
  });

  describe('delete()', () => {
    it('should be called on post service method when invoke it', async () => {
      await nvm.deletePost();
      expect(postService.deletePost).toBeCalled();
    });
  });
});
