/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-17 15:30:09
 * Copyright © RingCentral. All rights reserved.
 */

import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { IPreInsertController } from '../../../module/common/controller/interface/IPreInsertController';
import { Post, IPostQuery, IPostResult, IRawPostResult } from '../entity';
import { QUERY_DIRECTION } from '../../../dao/constants';
import { daoManager, GroupConfigDao, PostDao } from '../../../dao';
import { mainLogger } from 'foundation';
import { ItemService } from '../../item';
import { Item } from '../../item/entity';
import { DataHandleController } from './DataHandleController';
import PostAPI from '../../../api/glip/post';
import _ from 'lodash';

const DEFAULT_PAGE_SIZE = 20;
const TAG = 'PostFetchController';

class PostFetchController {
  private _dataHandleController: DataHandleController;

  constructor(
    public preInsertController: IPreInsertController,
    public entitySourceController: IEntitySourceController<Post>,
  ) {
    this._dataHandleController = new DataHandleController(
      preInsertController,
      entitySourceController,
    );
  }

  /** 1, Check does postId is 0 or post id is in db
   *  1) PostId is 0, means open conversation from group | contact | profile,
   *     should save fetch results from server to db
   *  2) PostId is not 0, means open conversation from @Mentions | Bookmarks,
   *     If postId in db, should save fetch results from server to db
   *  2, Fetch from local db if should save to db
   *  3, Check the fetched result from local has exceed limit, if not, check has more in server
   *  4, Find the valid anchor post id
   */
  async getPostsByGroupId({
    groupId,
    postId = 0,
    limit = DEFAULT_PAGE_SIZE,
    direction = QUERY_DIRECTION.OLDER,
  }: IPostQuery): Promise<IPostResult> {
    let result: IPostResult = {
      limit,
      posts: [],
      items: [],
      hasMore: true,
    };

    const shouldSaveToDb = postId === 0 || (await this._isPostInDb(postId));
    mainLogger.info(
      TAG,
      `getPostsByGroupId() postId: ${postId} shouldSaveToDb ${shouldSaveToDb} direction ${direction}`,
    );

    if (shouldSaveToDb) {
      result = await this._getPostsFromDb({
        groupId,
        postId,
        direction,
        limit,
      });
    }

    if (result.posts.length < limit) {
      const shouldFetch = await this._shouldFetchFromServer(direction, groupId);
      if (!shouldSaveToDb || shouldFetch) {
        mainLogger.debug(
          TAG,
          'getPostsByGroupId() db is not exceed limit, request from server',
        );
        const validAnchorPostId = this._findValidAnchorPostId(
          direction,
          result.posts,
        );
        const serverResult = await this.fetchPaginationPosts({
          groupId,
          direction,
          limit,
          postId: validAnchorPostId ? validAnchorPostId : postId,
        });
        if (serverResult) {
          const updateResult = (posts: Post[], items: Item[]) => {
            result.posts.push(...posts);
            result.items.push(...items);
            result.hasMore = serverResult.hasMore;
            if (shouldSaveToDb) {
              this._updateHasMore(groupId, direction, serverResult.hasMore);
            }
          };

          await this._dataHandleController.handleFetchedPosts(
            serverResult,
            shouldSaveToDb,
            updateResult,
          );
        }
      } else {
        result.hasMore = shouldFetch;
      }
    }
    result.limit = limit;
    return result;
  }

  async fetchPaginationPosts({
    groupId,
    postId,
    limit,
    direction,
  }: IPostQuery): Promise<IRawPostResult | null> {
    const result: IRawPostResult = {
      posts: [],
      items: [],
      hasMore: false,
    };

    const params: any = {
      limit,
      direction,
      group_id: groupId,
    };
    if (postId) {
      params.post_id = postId;
    }
    const requestResult = await PostAPI.requestPosts(params);
    if (requestResult.isOk()) {
      const data = requestResult.data;
      if (data) {
        result.posts = data.posts;
        result.items = data.items;
        result.hasMore = result.posts.length === limit;
      }
      return result;
    }
    return null;
  }

  private async _isPostInDb(postId: number): Promise<boolean> {
    const post = await this.entitySourceController.getEntityLocally(postId);
    return post ? true : false;
  }

  private async _getPostsFromDb({
    groupId,
    postId,
    direction,
    limit,
  }: IPostQuery): Promise<IPostResult> {
    const postDao = daoManager.getDao(PostDao);
    const posts: Post[] = await postDao.queryPostsByGroupId(
      groupId,
      postId,
      direction,
      limit,
    );
    const itemService: ItemService = ItemService.getInstance();
    const result: IPostResult = {
      limit,
      posts,
      hasMore: true,
      items: posts.length === 0 ? [] : await itemService.getByPosts(posts),
    };
    return result;
  }

  /**
   * If direction === QUERY_DIRECTION.OLDER, should check has more.
   * If direction === QUERY_DIRECTION.NEWER, return true
   */
  private async _shouldFetchFromServer(
    direction: QUERY_DIRECTION,
    groupId: number,
  ) {
    const groupConfigDao = daoManager.getDao(GroupConfigDao);
    const hasMore = await groupConfigDao.hasMoreRemotePost(groupId, direction);
    return direction === QUERY_DIRECTION.OLDER ? hasMore : true;
  }

  private _findValidAnchorPostId(direction: QUERY_DIRECTION, posts: Post[]) {
    if (posts && posts.length) {
      const validAnchorPost =
        direction === QUERY_DIRECTION.OLDER
          ? _.findLast(posts, (p: Post) => p.id > 0)
          : _.find(posts, (p: Post) => p.id > 0);
      return validAnchorPost ? validAnchorPost.id : 0;
    }
    return 0;
  }

  private _updateHasMore(
    groupId: number,
    direction: QUERY_DIRECTION,
    hasMore: boolean,
  ) {
    const groupConfigDao = daoManager.getDao(GroupConfigDao);
    groupConfigDao.update({
      id: groupId,
      [`has_more_${direction}`]: hasMore,
    });
  }
}

export { PostFetchController };
