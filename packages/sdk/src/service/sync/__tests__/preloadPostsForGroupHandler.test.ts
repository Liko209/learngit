/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 16:54:16
 * Copyright © RingCentral. All rights reserved.
 */

import PreloadPostsForGroupHandler from '../preloadPostsForGroupHandler';
import GroupService from '../../../module/group';

jest.mock('../../../module/group');

describe('PreloadPostsForGroupHandler', () => {
  const groupService = new GroupService();
  GroupService.getInstance = jest.fn().mockReturnValue(groupService);
  it('PreloadPostsForGroupHandler', async () => {
    const handler = new PreloadPostsForGroupHandler();
    groupService.getGroupsByType.mockResolvedValue([]);
    jest.spyOn(handler, '_preloadPosts').mockResolvedValue(true);
    await handler.preloadPosts();
    expect(handler._preloadPosts).toHaveBeenCalledTimes(3);
  });
});
