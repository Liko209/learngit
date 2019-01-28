/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 15:18:32
 * Copyright © RingCentral. All rights reserved.
 */
import { Group } from '../../module/group/entity';
import { IProcessor } from '../../framework/processor/IProcessor';
import { NewPostService } from '../../module/post';
import { mainLogger } from 'foundation';
import { StateService } from '../../module/state';
import { QUERY_DIRECTION } from '../../dao/constants';
import { NewGroupService } from '../../module/group';
import { IRequestRemotePostAndSave } from '../../module/post/entity/Post';

const DEFAULT_DIRECTION: QUERY_DIRECTION = QUERY_DIRECTION.OLDER;
const ONE_PAGE: number = 20;
class PreloadPostsProcessor implements IProcessor {
  private _name: string;
  private _canContinue: boolean;
  private _group: Group;
  private _isFavorite: boolean;
  constructor(name: string, group: Group, isFav: boolean) {
    this._name = name;
    this._canContinue = true;
    this._group = group;
    this._isFavorite = isFav;
  }

  async process(): Promise<boolean> {
    const result = await this.needPreload();
    mainLogger.info(
      `group id: ${this._group.id}, needPreload: ${
        result.shouldPreload
      } count:${result.limit}`,
    );
    if (result.shouldPreload) {
      const params: IRequestRemotePostAndSave = {
        limit: result.limit,
        direction: DEFAULT_DIRECTION,
        groupId: this._group.id,
        postId: 0,
        shouldSaveToDb: true,
      };
      const postService: NewPostService = NewPostService.getInstance();
      await postService.getRemotePostsByGroupIdAndSave(params);
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
    limit: number;
    shouldPreload: boolean;
  }> {
    // get profile
    let shouldPreload = false;
    let limit = 0;

    const stateService: StateService = StateService.getInstance();
    const state = await stateService.getById(this._group.id);

    const postService: NewPostService = NewPostService.getInstance();

    if (this._isFavorite || !this._group.is_team) {
      // if unread count < one page, load one page
      limit = ONE_PAGE;
      if (state && state.unread_count && state.unread_count > ONE_PAGE) {
        limit = state.unread_count;
      }

      const localPostCount = await postService.getPostCountByGroupId(
        this._group.id,
      );
      if (localPostCount < ONE_PAGE) {
        const groupService: NewGroupService = NewGroupService.getInstance();
        const hasMore = await groupService.hasMorePostInRemote(
          this._group.id,
          QUERY_DIRECTION.OLDER,
        );
        shouldPreload = hasMore;
      } else {
        // more than 1 page, do not pre load
        shouldPreload = false;
      }
    } else {
      // is team and not in favorite
      if (state && state.unread_mentions_count) {
        const post = await postService.getPostFromLocal(
          state.read_through || 0,
        );
        if (!post) {
          shouldPreload = true;
          limit = ONE_PAGE;
          if (state.unread_count && state.unread_count > ONE_PAGE) {
            limit = state.unread_count;
          }
        }
      }
    }

    return {
      shouldPreload,
      limit,
    };
  }
}

export default PreloadPostsProcessor;
