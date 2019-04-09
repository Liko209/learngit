/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-09 10:10:02
 * Copyright © RingCentral. All rights reserved.
 */
import { DeleteViewModel } from '../Delete.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';

const postService = {
  deletePost: jest.fn(),
};
ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);

let viewModel: DeleteViewModel;

describe('DeleteViewModel', () => {
  describe('deletePost()', () => {
    it('should call service deletePost [JPT-467]', async () => {
      viewModel = new DeleteViewModel({ id: 1 });
      await viewModel.deletePost();
      expect(postService.deletePost).toBeCalled();
    });
  });
});
