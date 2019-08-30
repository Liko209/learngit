/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-17 15:30:09
 * Copyright © RingCentral. All rights reserved.
 */

import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { Post, IPostQuery, IPostResult, IRawPostResult } from '../entity';
import { QUERY_DIRECTION } from '../../../dao/constants';
import { daoManager } from '../../../dao';
import { PostDao } from '../dao';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { ItemService } from '../../item';
import { PostDataController } from './PostDataController';
import PostAPI from '../../../api/glip/post';
import { DEFAULT_PAGE_SIZE, LOG_FETCH_POST } from '../constant';
import _ from 'lodash';
import { IGroupService } from '../../group/service/IGroupService';
import { IRemotePostRequest, UnreadPostQuery } from '../entity/Post';
import { POST_PERFORMANCE_KEYS } from '../config/performanceKeys';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

const ADDITIONAL_UNREAD_POST_COUNT = 500;
const DEFAULT_HAS_MORE = {
  older: true,
  newer: true,
  both: true,
};

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
      hasMore: _.cloneDeep(DEFAULT_HAS_MORE),
    };
    const performanceTracer = PerformanceTracer.start();
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
      mainLogger.info(
        LOG_FETCH_POST,
        `groupId: ${groupId} localSize:${result.posts.length}`,
      );
    }

    if (result.posts.length < limit) {
      const hasMorePostInRemote = await this._groupService.hasMorePostInRemote(
        groupId,
      );
      const shouldFetch = hasMorePostInRemote[direction];
      mainLogger.info(
        LOG_FETCH_POST,
        `getPostsByGroupId() groupId: ${groupId} shouldSaveToDb:${shouldSaveToDb} shouldFetch:${shouldFetch} localSize:${
          result.posts.length
        }`,
      );
      if (!shouldSaveToDb || shouldFetch) {
        result.hasMore[direction] = hasMorePostInRemote[direction];
        const validAnchorPostId = this._findValidAnchorPostId(
          direction,
          result.posts,
        );
        const fetchDirection =
          shouldSaveToDb && direction === QUERY_DIRECTION.BOTH
            ? QUERY_DIRECTION.OLDER
            : direction;
        const serverResult = await this.getRemotePostsByGroupId({
          groupId,
          limit,
          shouldSaveToDb,
          postId: validAnchorPostId ? validAnchorPostId : postId,
          direction: fetchDirection,
        });
        if (serverResult) {
          result.posts = this._handleDuplicatePosts(
            result.posts,
            serverResult.posts,
          );
          mainLogger.log(
            LOG_FETCH_POST,
            `after handled duplicate, resultSize:${result.posts.length}`,
          );
          result.items.push(...serverResult.items);
          result.hasMore[fetchDirection] = serverResult.hasMore;
        }
      } else {
        result.hasMore[direction] = shouldFetch;
      }
    }
    result.limit = limit;
    performanceTracer.end({
      key: POST_PERFORMANCE_KEYS.GOTO_CONVERSATION_FETCH_POSTS,
      count: result.posts && result.posts.length,
      infos: { groupId },
    });

    if (QUERY_DIRECTION.BOTH === direction && postId && limit) {
      this.setHasMoreNewerIfBothDirection(result, limit, postId);
    }

    return result;
  }

  setHasMoreNewerIfBothDirection(
    result: IPostResult,
    limit: number,
    postId: number,
  ) {
    if (result.posts) {
      const ids = result.posts.map(post => post && post.id);
      mainLogger.info(
        LOG_FETCH_POST,
        'setHasMoreNewerIfBothDirection() ids =',
        ids,
        ' limit = ',
        limit,
        ' postId = ',
        postId,
      );
      if (result.posts.length === limit) {
        const centerPost = result.posts[limit / 2];
        if (centerPost) {
          if (centerPost.id > postId) {
            result.hasMore.newer = true;
          } else if (centerPost.id < postId) {
            result.hasMore.newer = false;
          }
        }
      } else {
        result.hasMore.newer = false;
      }
    } else {
      result.hasMore.newer = false;
      mainLogger.info(
        LOG_FETCH_POST,
        'setHasMoreNewerIfBothDirection posts = undefined',
      );
    }
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
      hasMore: _.cloneDeep(DEFAULT_HAS_MORE),
    };
    mainLogger.info(
      LOG_FETCH_POST,
      `getUnreadPosts() groupId: ${groupId} startPostId: ${startPostId} endPostId: ${endPostId}`,
    );
    const performanceTracer = PerformanceTracer.start();
    if (startPostId > endPostId) {
      mainLogger
        .tags(LOG_FETCH_POST)
        .info(
          'getUnreadPostsByGroupId() return directly due to startPostId > endPostId',
        );
      return result;
    }

    let getPostsFromDb = false;
    if (startPostId === 0) {
      const { older } = await this._groupService.hasMorePostInRemote(groupId);
      getPostsFromDb = !older;
    } else if (await this._isPostInDb(startPostId)) {
      getPostsFromDb = true;
    }

    if (getPostsFromDb) {
      mainLogger.info(LOG_FETCH_POST, 'getUnreadPosts() get from db');
      result = await this._getUnreadPostsFromDb({
        groupId,
        startPostId,
        endPostId,
        unreadCount,
      });
    } else {
      mainLogger.info(LOG_FETCH_POST, 'getUnreadPosts() get from server');
      const serverResult = await this.getRemotePostsByGroupId({
        groupId,
        limit: unreadCount + ADDITIONAL_UNREAD_POST_COUNT,
        postId: startPostId,
        direction: QUERY_DIRECTION.NEWER,
        shouldSaveToDb: true,
      });

      let olderResult = null;
      if (
        startPostId > 0 &&
        serverResult &&
        (await this._groupService.hasMorePostInRemote(groupId)).older
      ) {
        const oldestPost = _.last(serverResult.posts);
        if (oldestPost) {
          olderResult = await this.getRemotePostsByGroupId({
            groupId,
            limit: DEFAULT_PAGE_SIZE,
            postId: oldestPost.id,
            direction: QUERY_DIRECTION.NEWER,
            shouldSaveToDb: true,
          });
        }
      }

      if (serverResult) {
        result.hasMore[QUERY_DIRECTION.NEWER] = serverResult.hasMore;
        if (olderResult) {
          result.posts = [...serverResult.posts, ...olderResult.posts];
          result.items = [...serverResult.items, ...olderResult.items];
          result.hasMore[QUERY_DIRECTION.OLDER] = olderResult.hasMore;
        } else {
          result.posts = serverResult.posts;
          result.items = serverResult.items;
        }
      }
    }
    performanceTracer.end({
      key: POST_PERFORMANCE_KEYS.CONVERSATION_FETCH_UNREAD_POST,
      count: result.posts && result.posts.length,
    });
    return result;
  }

  async fetchPaginationPosts({
    groupId,
    postId,
    limit,
    direction,
  }: IPostQuery): Promise<IRawPostResult | null> {
    const performanceTracer = PerformanceTracer.start();
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
    performanceTracer.end({
      key: POST_PERFORMANCE_KEYS.CONVERSATION_FETCH_FROM_SERVER,
      count: result.posts.length,
    });
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

      handledResult.posts.length &&
        this._groupService.handleGroupFetchedPosts(
          groupId,
          handledResult.posts,
        );
      return handledResult;
    }
    return serverResult;
  }

  private async _isPostInDb(postId: number): Promise<boolean> {
    const post = await this.entitySourceController.getEntityLocally(postId);
    return post ? true : false;
  }

  private _handleDuplicatePosts(localPosts: Post[], remotePosts: Post[]) {
    mainLogger.info(
      LOG_FETCH_POST,
      `_handleDuplicatePosts() localSize:${localPosts.length} remoteSize:${
        remotePosts.length
      }`,
    );
    if (localPosts && localPosts.length > 0) {
      if (remotePosts && remotePosts.length > 0) {
        remotePosts.forEach((remotePost: Post) => {
          const index = localPosts.findIndex(
            (localPost: Post) =>
              localPost.unique_id !== undefined &&
              localPost.unique_id === remotePost.unique_id,
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
      hasMore: _.cloneDeep(DEFAULT_HAS_MORE),
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
    const performanceTracer = PerformanceTracer.start();
    const postDao = daoManager.getDao(PostDao);
    const posts: Post[] = await postDao.queryPostsByGroupId(
      groupId,
      postId,
      direction,
      limit,
    );
    performanceTracer.end({
      key: POST_PERFORMANCE_KEYS.CONVERSATION_FETCH_FROM_DB,
      count: posts.length,
    });

    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    result.limit = limit;
    result.posts = posts;
    result.items =
      posts.length === 0 ? [] : await itemService.getByPosts(posts);
    return result;
  }

  private async _getUnreadPostsFromDb(
    unreadPostQuery: UnreadPostQuery,
  ): Promise<IPostResult> {
    const result: IPostResult = {
      limit: unreadPostQuery.unreadCount,
      posts: [],
      items: [],
      hasMore: _.cloneDeep(DEFAULT_HAS_MORE),
    };
    const performanceTracer = PerformanceTracer.start();
    const postDao = daoManager.getDao(PostDao);
    const posts: Post[] = await postDao.queryUnreadPostsByGroupId(
      unreadPostQuery,
    );
    performanceTracer.end({
      key: POST_PERFORMANCE_KEYS.CONVERSATION_FETCH_INTERVAL_POST,
      count: posts.length,
    });

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
