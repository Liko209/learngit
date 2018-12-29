/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 14:27:43
 * Copyright © RingCentral. All rights reserved.
 */
import { Group } from '../../module/group/entity';
import GroupService from '../../service/group';
import SequenceProcessorHandler from '../../framework/processor/SequenceProcessorHandler';
import PreloadPostsProcessor from './preloadPostsProcessor';

class PreloadPostsForGroupHandler {
  constructor() {}
  async preloadPosts() {
    const groupService: GroupService = GroupService.getInstance();
    return this._preloadPosts(await groupService.getLeftRailGroups());
  }

  private async _preloadPosts(groups: Group[]) {
    const handler = new SequenceProcessorHandler(
      'preloadSequenceProcessorHandler',
    );
    groups.forEach((group: Group) => {
      const processor = new PreloadPostsProcessor(`${group.id}`, group);
      handler.addProcessor(processor);
    });
    return await handler.process();
  }
}

export default PreloadPostsForGroupHandler;
