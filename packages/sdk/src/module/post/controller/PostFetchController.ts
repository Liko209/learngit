/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-17 15:30:09
 * Copyright © RingCentral. All rights reserved.
 */

import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { Post, IPostQuery, IPostResult, IRawPostResult } from '../entity';
import { QUERY_DIRECTION } from '../../../dao/constants';
import { daoManager } from '../../../dao';
import { PostDao } from '../../../module/post/dao';
import { mainLogger } from 'foundation';
import { ItemService } from '../../item';
import { PostDataController } from './PostDataController';
import PostAPI from '../../../api/glip/post';
import { DEFAULT_PAGE_SIZE, LOG_FETCH_POST } from '../constant';
import _ from 'lodash';
import { IGroupService } from '../../../module/group/service/IGroupService';
import { IRemotePostRequest, UnreadPostQuery } from '../entity/Post';
import { PerformanceTracerHolder, PERFORMANCE_KEYS } from '../../../utils';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';

class PostFetchController {
  constructor(
    private _groupService: IGroupService,
    public postDataController: PostDataController,
    public entitySourceController: IEntitySourceController<Post>,
  ) {}

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

    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.GOTO_CONVERSATION_FETCH_POSTS,
      logId,
    );
    const shouldSaveToDb = postId === 0 || (await this._isPostInDb(postId));
    mainLogger.info(
      LOG_FETCH_POST,
      `getPostsByGroupId() groupId: ${groupId} postId: ${postId} shouldSaveToDb ${shouldSaveToDb} direction ${direction}`,
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
      const shouldFetch = await this._groupService.hasMorePostInRemote(
        groupId,
        direction,
      );
      mainLogger.info(
        LOG_FETCH_POST,
        `getPostsByGroupId() groupId: ${groupId} shouldSaveToDb:${shouldSaveToDb} shouldFetch:${shouldFetch}`,
      );
      if (!shouldSaveToDb || shouldFetch) {
        const validAnchorPostId = this._findValidAnchorPostId(
          direction,
          result.posts,
        );
        const serverResult = await this.getRemotePostsByGroupId({
          groupId,
          limit,
          shouldSaveToDb,
          postId: validAnchorPostId ? validAnchorPostId : postId,
          direction:
            shouldSaveToDb && direction === QUERY_DIRECTION.BOTH
              ? QUERY_DIRECTION.OLDER
              : direction,
        });
        if (serverResult) {
          result.posts = this._handleDuplicatePosts(
            result.posts,
            serverResult.posts,
          );
          result.items.push(...serverResult.items);
          result.hasMore = serverResult.hasMore;
        }
      } else {
        result.hasMore = shouldFetch;
      }
    }
    result.limit = limit;
    PerformanceTracerHolder.getPerformanceTracer().end(
      logId,
      result.posts && result.posts.length,
    );
    return result;
  }

  async getUnreadPostsByGroupId({
    groupId,
    startPostId,
    endPostId,
    unreadCount = DEFAULT_PAGE_SIZE,
  }: UnreadPostQuery): Promise<IPostResult> {
    let result: IPostResult = {
      limit: unreadCount,
      posts: [],
      items: [],
      hasMore: true,
    };
    mainLogger.info(
      LOG_FETCH_POST,
      `getUnreadPosts() groupId: ${groupId} startPostId: ${startPostId} endPostId: ${endPostId}`,
    );

    if (startPostId) {
      const logId = Date.now();
      PerformanceTracerHolder.getPerformanceTracer().start(
        PERFORMANCE_KEYS.CONVERSATION_FETCH_UNREAD_POST,
        logId,
      );
      const isPostInDb = await this._isPostInDb(startPostId);
      if (isPostInDb) {
        mainLogger.info(LOG_FETCH_POST, 'getUnreadPosts() get from db');
        result = await this._getIntervalPostsFromDb({
          groupId,
          startPostId,
          endPostId,
          unreadCount,
        });
      } else {
        mainLogger.info(LOG_FETCH_POST, 'getUnreadPosts() get from server');
        const serverResult = await this.getRemotePostsByGroupId({
          groupId,
          limit: unreadCount,
          postId: startPostId,
          direction: QUERY_DIRECTION.NEWER,
          shouldSaveToDb: false,
        });
        if (serverResult) {
          result.posts = serverResult.posts;
          result.items = serverResult.items;
          result.hasMore = serverResult.hasMore;
        }
      }
      PerformanceTracerHolder.getPerformanceTracer().end(
        logId,
        result.posts && result.posts.length,
      );
    }
    return result;
  }

  async fetchPaginationPosts({
    groupId,
    postId,
    limit,
    direction,
  }: IPostQuery): Promise<IRawPostResult | null> {
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.CONVERSATION_FETCH_FROM_SERVER,
      logId,
    );
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
    const data = await PostAPI.requestPosts(params);
    mainLogger.info(
      LOG_FETCH_POST,
      `fetchPaginationPosts() groupId:${groupId} postId:${postId} fetch done`,
    );
    if (data) {
      result.posts = data.posts;
      result.items = data.items;
      result.hasMore = result.posts.length === limit;
    }
    PerformanceTracerHolder.getPerformanceTracer().end(
      logId,
      result.posts.length,
    );
    return result;
  }

  async getRemotePostsByGroupId({
    direction,
    groupId,
    limit,
    postId,
    shouldSaveToDb,
  }: IRemotePostRequest) {
    mainLogger.debug(
      LOG_FETCH_POST,
      groupId,
      'getRemotePostsByGroupId() db is not exceed limit, request from server',
    );
    const serverResult = await this.fetchPaginationPosts({
      groupId,
      direction,
      limit,
      postId,
    });

    if (serverResult) {
      const handledResult = await this.postDataController.handleFetchedPosts(
        serverResult,
        shouldSaveToDb,
      );
      if (shouldSaveToDb) {
        this._groupService.updateHasMore(
          groupId,
          direction,
          handledResult.hasMore,
        );
      }
      return handledResult;
    }
    return serverResult;
  }

  private async _isPostInDb(postId: number): Promise<boolean> {
    const post = await this.entitySourceController.getEntityLocally(postId);
    return post ? true : false;
  }

  private _handleDuplicatePosts(localPosts: Post[], remotePosts: Post[]) {
    mainLogger.info(LOG_FETCH_POST, '_handleDuplicatePosts()');
    if (localPosts && localPosts.length > 0) {
      if (remotePosts && remotePosts.length > 0) {
        remotePosts.forEach((remotePost: Post) => {
          const index = localPosts.findIndex(
            (localPost: Post) => localPost.unique_id === remotePost.unique_id,
          );
          if (index !== -1) {
            localPosts.splice(index, 1);
          }
        });
        return localPosts.concat(remotePosts);
      }
      return localPosts;
    }
    return remotePosts;
  }

  private async _getPostsFromDb({
    groupId,
    postId,
    direction,
    limit,
  }: IPostQuery): Promise<IPostResult> {
    const result: IPostResult = {
      limit,
      posts: [],
      items: [],
      hasMore: true,
    };
    mainLogger.info(
      LOG_FETCH_POST,
      `_getPostsFromDb() groupId:${groupId} postId:${postId} direction:${direction} limit:${limit}`,
    );
    if (!postId && direction === QUERY_DIRECTION.NEWER) {
      mainLogger.info(
        LOG_FETCH_POST,
        '_getPostsFromDb() return due to postId = 0 and fetch newer',
      );
      return result;
    }
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.CONVERSATION_FETCH_FROM_DB,
      logId,
    );
    const postDao = daoManager.getDao(PostDao);
    const posts: Post[] = await postDao.queryPostsByGroupId(
      groupId,
      postId,
      direction,
      limit,
    );
    PerformanceTracerHolder.getPerformanceTracer().end(logId, posts.length);

    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    result.limit = limit;
    result.posts = posts;
    result.items =
      posts.length === 0 ? [] : await itemService.getByPosts(posts);
    return result;
  }

  private async _getIntervalPostsFromDb(
    unreadPostQuery: UnreadPostQuery,
  ): Promise<IPostResult> {
    const result: IPostResult = {
      limit: unreadPostQuery.unreadCount,
      posts: [],
      items: [],
      hasMore: true,
    };

    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.CONVERSATION_FETCH_INTERVAL_POST,
      logId,
    );
    const postDao = daoManager.getDao(PostDao);
    const posts: Post[] = await postDao.queryIntervalPostsByGroupId(
      unreadPostQuery,
    );
    PerformanceTracerHolder.getPerformanceTracer().end(logId, posts.length);

    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    result.posts = posts;
    result.items =
      posts.length === 0 ? [] : await itemService.getByPosts(posts);
    return result;
  }

  private _findValidAnchorPostId(direction: QUERY_DIRECTION, posts: Post[]) {
    mainLogger.info(LOG_FETCH_POST, '_findValidAnchorPostId()');
    if (posts && posts.length) {
      const validAnchorPost =
        direction === QUERY_DIRECTION.OLDER
          ? _.find(posts, (p: Post) => p.id > 0)
          : _.findLast(posts, (p: Post) => p.id > 0);
      return validAnchorPost ? validAnchorPost.id : 0;
    }
    return 0;
  }

  async getPostCountByGroupId(groupId: number): Promise<number> {
    const dao = daoManager.getDao(PostDao);
    return dao.groupPostCount(groupId);
  }
}

export { PostFetchController };
