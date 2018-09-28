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

const DEFAULT_LIMIT: number = 20;
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
    try {
      if (true) {
        return true;
      }
      const needPreload = await this._needPreload();
      mainLogger.info(
        `group id: ${this._group.id}, needPreload: ${needPreload}`,
      );
      if (needPreload) {
        const params: any = {
          limit: DEFAULT_LIMIT,
          direction: DEFAULT_DIRECTION,
          group_id: this._group.id,
        };
        const requestResult = await PostAPI.requestPosts(params);
        if (requestResult.status && requestResult.status >= 500) {
          this._canContinue = false;
          return false;
        }
        if (requestResult.data) {
          baseHandleData(requestResult.data.posts || []);
          itemHandleData(requestResult.data.items || []);
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  canContinue(): boolean {
    return this._canContinue;
  }

  name(): string {
    return this._name;
  }

  private async _needPreload(): Promise<boolean> {
    if (this._group.most_recent_post_id) {
      const postService: PostService = PostService.getInstance();
      const inLocal = await postService.groupHasPostInLocal(this._group.id);
      return !inLocal;
    }
    return false;
  }
}

export default PreloadPostsProcessor;
