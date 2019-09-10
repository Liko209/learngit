/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { ProgressActionsViewModel } from '../ProgressActions.ViewModel';
import { getEntity } from '@/store/utils';
import { Notification } from '@/containers/Notification';
import { PROGRESS_STATUS } from 'sdk/module/progress';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { IMessageService, IMessageStore } from '@/modules/message/interface';
import { MessageService } from '@/modules/message/service';
import { MessageStore } from '@/modules/message/store';
import { jupiter } from 'framework/Jupiter';
import { TypeDictionary } from 'sdk/utils';

jupiter.registerService(IMessageService, MessageService);
jupiter.registerService(IMessageStore, MessageStore);

jest.mock('@/store/utils');
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

ServiceLoader.getInstance = jest
  .fn()
  .mockImplementation((serviceName: string) => {
    if (serviceName === ServiceConfig.POST_SERVICE) {
      return postService;
    }
    if (serviceName === ServiceConfig.ITEM_SERVICE) {
      return itemService;
    }
    return null;
  });

const mockPostData = {
  id: -123,
  progressStatus: PROGRESS_STATUS.FAIL,
  itemIds: [1],
  text: '',
  itemTypeIds: {},
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

  describe('showEditAction', () => {
    it.each`
      _isText  | _isEventOrTask | expected
      ${true}  | ${true}        | ${false}
      ${true}  | ${false}       | ${true}
      ${false} | ${true}        | ${false}
      ${false} | ${false}       | ${false}
    `(
      'should be $expected when _isText is $_isText and _isEventOrTask is $_isEventOrTask',
      ({ _isText, _isEventOrTask, expected }) => {
        mockPostData.text = _isText ? 'test' : '';
        mockPostData.itemTypeIds = _isEventOrTask
          ? { [TypeDictionary.TYPE_ID_TASK]: true }
          : {};
        expect(nvm.showEditAction).toBe(expected);
      },
    );
  });

  describe('resend()', () => {
    it('should be called on post service method when invoke it', async () => {
      await nvm.resend();
      expect(postService.reSendPost).toHaveBeenCalled();
    });

    it('should not call Notification when reSendPost failed JPT-617', async () => {
      postService.reSendPost.mockRejectedValueOnce(new Error());
      expect(nvm.resend()).rejects.toThrow();
      expect(Notification.flashToast).not.toHaveBeenCalled();
    });

    it('should not call resend when has failed items JPT-617', async () => {
      (itemService.canResendFailedItems as jest.Mock).mockReturnValueOnce(
        false,
      );
      await nvm.resend();
      expect(postService.reSendPost).toHaveBeenCalledTimes(0);
      expect(Notification.flashToast).toHaveBeenCalled();
    });

    it('should debounce the call', async () => {
      await Promise.all([
        nvm.resend(),
        nvm.resend(),
        nvm.resend(),
        nvm.resend(),
      ]);
      expect(postService.reSendPost).toHaveBeenCalledTimes(1);
    });
  });

  describe('edit()', () => {
    it('should enter edit mode when being called [JPT-2545]', async () => {
      window.requestAnimationFrame = jest.fn().mockImplementation(fn => fn());
      await nvm.edit();
      const globalStore = storeManager.getGlobalStore();
      expect(
        globalStore.get(GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS).includes(nvm.id),
      ).toBeTruthy();
    });
  });

  describe('delete()', () => {
    it('should be called on post service method when invoke it', async () => {
      await nvm.deletePost();
      expect(postService.deletePost).toHaveBeenCalled();
    });

    it('should debounce the call', async () => {
      await Promise.all([
        nvm.deletePost(),
        nvm.deletePost(),
        nvm.deletePost(),
        nvm.deletePost(),
      ]);
      expect(postService.deletePost).toHaveBeenCalledTimes(1);
    });
  });
});
