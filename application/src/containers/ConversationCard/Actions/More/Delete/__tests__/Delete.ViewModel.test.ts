/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-09 10:10:02
 * Copyright © RingCentral. All rights reserved.
 */
import { DeleteViewModel } from '../Delete.ViewModel';

const mockPostService = {
  deletePost: jest.fn(),
};
jest.mock('sdk/service/post', () => ({
  default: {
    getInstance: () => mockPostService,
  },
}));

let ViewModel: DeleteViewModel;

describe('DeleteVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    ViewModel = new DeleteViewModel({ id: 1 });
  });

  describe('deletePost()', () => {
    it('should call service deletePost [JPT-467]', async () => {
      await ViewModel.deletePost();
      expect(mockPostService.deletePost).toBeCalled();
    });
  });
});
