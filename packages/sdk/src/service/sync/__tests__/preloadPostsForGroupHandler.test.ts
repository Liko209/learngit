/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 16:54:16
 * Copyright © RingCentral. All rights reserved.
 */

import PreloadPostsForGroupHandler from '../preloadPostsForGroupHandler';
import GroupService from '../../../service/group';

jest.mock('../../../service/group');

describe('PreloadPostsForGroupHandler', () => {
  const groupService = new GroupService();
  GroupService.getInstance = jest.fn().mockReturnValue(groupService);
  it('PreloadPostsForGroupHandler', async () => {
    const handler = new PreloadPostsForGroupHandler();
    groupService.getLeftRailGroups.mockResolvedValueOnce([]);
    const result = await handler.preloadPosts();
    expect(result).toBe(true);
  });
});
