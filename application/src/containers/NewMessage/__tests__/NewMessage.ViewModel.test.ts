/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-23 10:28:53
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import { BaseError, ErrorTypes } from 'sdk/utils';
import { err, ok } from 'foundation';
import { NewMessageViewModel } from '../NewMessage.ViewModel';
jest.mock('../../Notification');
jest.mock('../../../store/utils');
jest.mock('../../../store/index');

const { PostService } = service;

const postService = {
  newMessageWithPeopleIds() {},
};

const newMessageVM = new NewMessageViewModel();
function getNewBaseError(type: ErrorTypes, message: string = '') {
  return new BaseError(type, message);
}

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
    postService.newMessageWithPeopleIds = jest
      .fn()
      .mockImplementation(() => ok({}));

    const message = 'test';
    const memberIds = [1, 2];
    await newMessageVM.newMessage(memberIds, message);
    expect(postService.newMessageWithPeopleIds).toHaveBeenCalledWith(
      memberIds,
      message,
    );
  });

  it('create team success handle error', async () => {
    const baseError = new BaseError(ErrorTypes.API_INVALID_FIELD, '');
    postService.newMessageWithPeopleIds = jest
      .fn()
      .mockResolvedValueOnce(err(baseError));

    jest.spyOn(newMessageVM, 'newMessageErrorHandler');
    const message = 'test';
    const memberIds = [1, 2];
    const result = await newMessageVM.newMessage(memberIds, message);
    expect(result).toBeNull();
    expect(newMessageVM.newMessageErrorHandler).toHaveBeenCalledWith(baseError);
  });

  it('newMessageErrorHandler()', () => {
    const error = getNewBaseError(
      ErrorTypes.API_INVALID_FIELD,
      'This is not a valid email address: q@qq.com.',
    );
    newMessageVM.newMessageErrorHandler(error);
    expect(newMessageVM.emailErrorMsg).toBe('Invalid Email');
    expect(newMessageVM.emailError).toBe(true);
  });

  it('new message server error', async () => {
    const baseError = new BaseError(ErrorTypes.UNDEFINED_ERROR, '');
    postService.newMessageWithPeopleIds = jest
      .fn()
      .mockResolvedValueOnce(err(baseError));

    const message = 'test';
    const memberIds = [1, 2];
    const result = await newMessageVM.newMessage(memberIds, message);
    expect(result).toBeNull();
  });
});
