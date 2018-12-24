/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 15:18:32
 * Copyright © RingCentral. All rights reserved.
 */
import { Group } from '../../models';
import { IProcessor } from '../../framework/processor/IProcessor';
import PostService from '../../service/post';
import PostAPI from '../../api/glip/post';
import { baseHandleData } from '../post/handleData';
import itemHandleData from '../item/handleData';
import { mainLogger } from 'foundation';
import StateService from '../state';

const DEFAULT_DIRECTION: string = 'order';
class PreloadPostsProcessor implements IProcessor {
  private _name: string;
  private _canContinue: boolean;
  private _group: Group;
  constructor(name: string, group: Group) {
    this._name = name;
    this._canContinue = true;
    this._group = group;
  }

  async process(): Promise<boolean> {
    const result = await this.needPreload();
    mainLogger.info(
      `group id: ${this._group.id}, needPreload: ${
        result.shouldPreload
      } count:${result.unread_count}`,
    );
    if (result.shouldPreload) {
      const params: any = {
        limit: result.unread_count,
        direction: DEFAULT_DIRECTION,
        group_id: this._group.id,
      };
      const requestResult = await PostAPI.requestPosts(params);

      if (requestResult.isOk()) {
        baseHandleData(requestResult.data.posts || [], true);
        itemHandleData(requestResult.data.items || []);
      }
    }
    return true;
  }
  canContinue(): boolean {
    return this._canContinue;
  }

  name(): string {
    return this._name;
  }

  async needPreload(): Promise<{
    unread_count: number;
    shouldPreload: boolean;
  }> {
    let shouldPreload = false;
    let unread_count = 0;
    if (this._group.most_recent_post_id) {
      const stateService: StateService = StateService.getInstance();
      const state = await stateService.getById(this._group.id);
      if (state) {
        if (
          state.unread_count &&
          state.unread_count > 0 &&
          state.unread_count <= 100
        ) {
          const postService: PostService = PostService.getInstance();
          const post = await postService.getByIdFromDao(
            state.read_through || 0,
          );
          shouldPreload = !(post && !post.deactivated);
          unread_count = state.unread_count;
        }
      }
    }
    return {
      unread_count,
      shouldPreload,
    };
  }
}

export default PreloadPostsProcessor;
