/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 14:27:43
 * Copyright © RingCentral. All rights reserved.
 */
import { Group } from '../../module/group/entity';
import GroupService from '../../module/group';
import SequenceProcessorHandler from '../../framework/processor/SequenceProcessorHandler';
import PreloadPostsProcessor from './preloadPostsProcessor';
import { GROUP_QUERY_TYPE } from '../constants';

class PreloadPostsForGroupHandler {
  constructor() {}
  async preloadPosts() {
    const groupService: GroupService = GroupService.getInstance();
    const types = [
      GROUP_QUERY_TYPE.FAVORITE,
      GROUP_QUERY_TYPE.GROUP,
      GROUP_QUERY_TYPE.TEAM,
    ];
    for (let i = 0; i < types.length; i += 1) {
      const groups = await groupService.getGroupsByType(types[i]);
      await this._preloadPosts(groups, types[i] === GROUP_QUERY_TYPE.FAVORITE);
    }
  }

  private async _preloadPosts(groups: Group[], isFav: boolean) {
    const handler = new SequenceProcessorHandler(
      'preloadSequenceProcessorHandler',
    );
    groups.forEach((group: Group) => {
      const processor = new PreloadPostsProcessor(`${group.id}`, group, isFav);
      handler.addProcessor(processor);
    });
    return await handler.execute();
  }
}

export default PreloadPostsForGroupHandler;
