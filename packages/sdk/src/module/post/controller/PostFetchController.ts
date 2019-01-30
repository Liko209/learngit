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
import { PostDataController } from './PostDataController';
import PostAPI from '../../../api/glip/post';
import { DEFAULT_PAGE_SIZE } from '../constant';
import _ from 'lodash';
import { PerformanceTracerHolder, PERFORMANCE_KEYS } from '../../../utils';

const TAG = 'PostFetchController';

class PostFetchController {
  private _postDataController: PostDataController;

  constructor(
    public preInsertController: IPreInsertController,
    public entitySourceController: IEntitySourceController<Post>,
  ) {
    this._postDataController = new PostDataController(
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

    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.GOTO_CONVERSATION_FETCH_POSTS,
    );
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

          await this._postDataController.handleFetchedPosts(
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
    PerformanceTracerHolder.getPerformanceTracer().end(
      PERFORMANCE_KEYS.GOTO_CONVERSATION_FETCH_POSTS,
    );
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

  async getPostsByIds(
    ids: number[],
  ): Promise<{ posts: Post[]; items: Item[] }> {
    const itemService: ItemService = ItemService.getInstance();
    const localPosts = await this.entitySourceController.batchGet(ids);
    const result = {
      posts: localPosts,
      items: await itemService.getByPosts(localPosts),
    };
    const restIds = _.difference(ids, localPosts.map(({ id }) => id));
    if (restIds.length) {
      const remoteResult = await PostAPI.requestByIds(restIds);
      const remoteData = remoteResult.expect('getPostsByIds failed');
      const posts: Post[] =
        (await this._postDataController.filterAndSavePosts(
          this._postDataController.transformData(remoteData.posts),
          false,
        )) || [];
      const itemService = ItemService.getInstance() as ItemService;
      const items =
        (await itemService.handleIncomingData(remoteData.items)) || [];
      result.posts.push(...posts);
      result.items.push(...items);
    }
    return result;
  }

  async getLastPostOfGroup(groupId: number): Promise<Post | null> {
    const postDao = daoManager.getDao(PostDao);
    return postDao.queryLastPostByGroupId(groupId);
  }

  async groupHasPostInLocal(groupId: number) {
    const postDao: PostDao = daoManager.getDao(PostDao);
    const posts: Post[] = await postDao.queryPostsByGroupId(
      groupId,
      0,
      undefined,
      1,
    );
    return posts.length !== 0;
  }

  async getNewestPostIdOfGroup(groupId: number): Promise<number | null> {
    const result = await this.fetchPaginationPosts({
      groupId,
      limit: 1,
    });
    if (result && result.posts && result.posts.length) {
      return result.posts[0]._id;
    }
    return null;
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
    return direction === QUERY_DIRECTION.OLDER
      ? await groupConfigDao.hasMoreRemotePost(groupId, direction)
      : true;
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
