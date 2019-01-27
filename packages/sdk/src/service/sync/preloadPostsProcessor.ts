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
import { ProfileService } from '../../service/profile';
import { Profile } from '../../module/profile/entity';
import { QUERY_DIRECTION } from '../../dao/constants';

const DEFAULT_DIRECTION: string = QUERY_DIRECTION.OLDER;
const ONE_PAGE: number = 20;
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
      } count:${result.limit}`,
    );
    if (result.shouldPreload) {
      const params: any = {
        limit: result.limit,
        direction: DEFAULT_DIRECTION,
        groupId: this._group.id,
      };
      const postService: NewPostService = NewPostService.getInstance();
      await postService.getPostsByGroupId(params);
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

    if (this._group) {
      const profileService: ProfileService = ProfileService.getInstance();
      const profile: Profile = await profileService.getProfile();
      const favGroupIds = profile.favorite_group_ids || [];

      const stateService: StateService = StateService.getInstance();
      const state = await stateService.getById(this._group.id);

      const postService: NewPostService = NewPostService.getInstance();

      if (favGroupIds.includes(this._group.id) || !this._group.is_team) {
        // if unread count < one page, load one page
        limit = ONE_PAGE;
        if (state && state.unread_count && state.unread_count > ONE_PAGE) {
          limit = state.unread_count;
        }

        const localPostCount = await postService.getPostCountByGroupId(
          this._group.id,
        );
        if (localPostCount < ONE_PAGE) {
          const hasMore = await postService.hasMorePostInRemote(
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
    }
    return {
      limit,
      shouldPreload,
    };
  }
}

export default PreloadPostsProcessor;
