/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-23 10:28:53
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import { getGlobalValue } from '../../../store/utils';
import storeManager from '../../../store/index';
import { NewMessageViewModel } from '../NewMessage.ViewModel';
jest.mock('../../../store/utils');
jest.mock('../../../store/index');

const { PostService } = service;

const postService = {
  newMessageWithPeopleIds() {},
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
    postService.newMessageWithPeopleIds = jest
      .fn()
      .mockImplementation(() => ({}));

    const message = 'test';
    const memberIds = [1, 2];
    await newMessageVM.newMessage(memberIds, message);
    expect(postService.newMessageWithPeopleIds).toHaveBeenCalledWith(
      memberIds,
      message,
    );
  });

  it('create team success handle error', async () => {
    postService.newMessageWithPeopleIds = jest.fn().mockResolvedValue({
      error: {
        code: 'invalid_field',
      },
    });

    jest.spyOn(newMessageVM, 'newMessageErrorHandler');
    const message = 'test';
    const memberIds = [1, 2];
    try {
      await newMessageVM.newMessage(memberIds, message);
    } catch (err) {
      expect(newMessageVM.newMessageErrorHandler).toHaveBeenCalledWith({
        error: {
          code: 'invalid_field',
        },
      });
    }
  });

  it('newMessageErrorHandler()', () => {
    newMessageVM.newMessageErrorHandler({
      error: {
        message: 'This is not a valid email address: q@qq.com.',
        validation: true,
        code: 'invalid_field',
      },
    });
    expect(newMessageVM.emailErrorMsg).toBe('Invalid Email');
    expect(newMessageVM.emailError).toBe(true);
  });

  it('new message server error', async () => {
    postService.newMessageWithPeopleIds = jest.fn().mockRejectedValue('error');

    const message = 'test';
    const memberIds = [1, 2];
    try {
      await newMessageVM.newMessage(memberIds, message);
    } catch (err) {
      expect(newMessageVM.serverError).toBe(true);
    }
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
