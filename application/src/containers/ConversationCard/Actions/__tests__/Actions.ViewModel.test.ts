/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import { ActionsViewModel } from '../Actions.ViewModel';

const { PostService } = service;
const postService = {
  reSendPost: jest.fn(),
  deletePost: jest.fn(),
};
PostService.getInstance = jest.fn().mockReturnValue(postService);

const mockPostEntityData = {};
// @ts-ignore
const getEntity = jest.fn().mockReturnValue(mockPostEntityData);

const actionsViewModel = new ActionsViewModel();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ActionsViewModel', () => {
  it('lifecycle onReceiveProps method', () => {
    let id = 123;
    actionsViewModel.onReceiveProps({ id });
    expect(actionsViewModel.id).toBe(id);
    id = 123;
    actionsViewModel.onReceiveProps({ id });
    expect(actionsViewModel.id).toBe(id);
  });

  it.skip('get computed post', () => {
    expect(actionsViewModel.post).toBe(mockPostEntityData);
  });

  it('resend()', async () => {
    await actionsViewModel.resend();
    expect(postService.reSendPost).toBeCalled();
  });

  it('delete()', async () => {
    await actionsViewModel.deletePost();
    expect(postService.deletePost).toBeCalled();
  });
});
