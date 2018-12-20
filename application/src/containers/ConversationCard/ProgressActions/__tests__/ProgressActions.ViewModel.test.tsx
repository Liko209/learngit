/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { PostService, POST_STATUS } from 'sdk/service';
import { ProgressActionsViewModel } from '../ProgressActions.ViewModel';
import { getEntity } from '../../../../store/utils';

jest.mock('../../../../store/utils');
jest.mock('sdk/service');

const postService = {
  reSendPost: jest.fn(),
  deletePost: jest.fn(),
};
PostService.getInstance = jest.fn().mockReturnValue(postService);

const mockPostData = {
  id: 123,
  status: POST_STATUS.SUCCESS,
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

  describe('post', () => {
    it('should be get post entity when invoke class instance property post', () => {
      expect(vm.post).toEqual(mockPostData);
    });

    it('should be get POST_STATUS.INPROGRESS when change post status', () => {
      mockPostData.status = POST_STATUS.INPROGRESS;
      expect(vm.post.status).toEqual(POST_STATUS.INPROGRESS);
    });

    it('should be get POST_STATUS.FAIL when change post status', () => {
      mockPostData.status = POST_STATUS.FAIL;
      expect(vm.post.status).toEqual(POST_STATUS.FAIL);
    });
  });

  describe('resend()', () => {
    it('should be called on post service method when invoke it', async () => {
      await vm.resend();
      expect(postService.reSendPost).toBeCalled();
    });
  });

  describe('delete()', () => {
    it('should be called on post service method when invoke it', async () => {
      await vm.deletePost();
      expect(postService.deletePost).toBeCalled();
    });
  });
});
