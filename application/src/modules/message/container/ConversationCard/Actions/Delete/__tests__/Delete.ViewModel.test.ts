/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-09 10:10:02
 * Copyright © RingCentral. All rights reserved.
 */
import { DeleteViewModel } from '../Delete.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { Notification } from '@/containers/Notification';
import { ERROR_CODES_NETWORK, JNetworkError, JServerError, ERROR_CODES_SERVER } from 'sdk/error';

jest.mock('@/containers/Notification');

function setUpMock(isFailed: boolean, errorType?: 'network' | 'server') {
  let postService;
  if (!isFailed) {
    postService = {
      deletePost: jest.fn(),
    };
  } else {
    postService = {
      deletePost: jest.fn().mockImplementationOnce(() => {
        if (errorType === 'network') {
          throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
        }
        if (errorType === 'server') {
          throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
        }
      }),
    };
  }
  ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);
  return postService;
}

let viewModel: DeleteViewModel;

describe('DeleteViewModel', () => {
  beforeEach(() => {
    Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
  });
  describe('deletePost()', () => {
    it('should call service deletePost [JPT-467]', async () => {
      const postService = setUpMock(false);
      viewModel = new DeleteViewModel({ id: 1 });
      await viewModel.deletePost();
      expect(postService.deletePost).toBeCalled();
    });
    it('Failed to delete post due to network disconnection [JPT-1826]', async () => {
      setUpMock(true, 'network');
      viewModel = new DeleteViewModel({ id: 1 });
      await viewModel.deletePost();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.deletePostFailedForNetworkIssue',
        }),
      );
    });
    it('Failed to delete post due to unexpected backend issue [JPT-1825]', async () => {
      setUpMock(true, 'server');
      viewModel = new DeleteViewModel({ id: 1 });
      await viewModel.deletePost();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.deletePostFailedForServerIssue',
        }),
      );
    });
  });
});
