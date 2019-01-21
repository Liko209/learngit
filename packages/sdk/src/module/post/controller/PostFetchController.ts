import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { IRequestController } from '../../../framework/controller/interface/IRequestController';
import { IPreInsertController } from '../../../module/common/controller/interface/IPreInsertController';
import { Post, IPostQuery, IPostResult } from '../entity';
import { Raw } from '../../../framework/model';
import { QUERY_DIRECTION } from '../../../dao/constants';
import { daoManager, PostDao, GroupConfigDao } from '../../../dao';
import { mainLogger } from 'foundation';
import { ItemService } from '../../item/service/ItemService';
import { transform } from '../../../service/utils';
import { Item } from '../../item/entity';
import _ from 'lodash';

/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-17 15:30:09
 * Copyright © RingCentral. All rights reserved.
 */
const DEFAULT_PAGE_SIZE = 20;
const TAG = 'PostFetchController';

type IRawPostResult = {
  posts: Raw<Post>[];
  items: Raw<Item>[];
  hasMore: boolean;
};

class PostFetchController {
  constructor(
    public requestController: IRequestController<Post>,
    public sourceEntityController: IEntitySourceController<Post>,
    public preInsertController: IPreInsertController,
  ) {}

  async getPostsByGroupId({
    groupId,
    postId = 0,
    limit = DEFAULT_PAGE_SIZE,
    direction = QUERY_DIRECTION.OLDER,
  }: IPostQuery): Promise<IPostResult> {
    const shouldSaveToDb = postId === 0 || (await this._isPostInDb(postId));
    mainLogger.info(
      TAG,
      `getPostsByGroupId() postId: ${postId} shouldSaveToDb ${shouldSaveToDb} direction ${direction}`,
    );
    let result: IPostResult = {
      limit,
      posts: [],
      items: [],
      hasMore: true,
    };

    // fetch from local db firstly
    if (shouldSaveToDb) {
      result = await this._getPostsFromDb({
        groupId,
        postId,
        direction,
        limit,
      });
    }

    if (result.posts.length < limit) {
      const groupConfigDao = daoManager.getDao(GroupConfigDao);
      const shouldGetMoreFromServer =
        shouldSaveToDb && direction === QUERY_DIRECTION.OLDER
          ? await groupConfigDao.hasMoreRemotePost(groupId, direction)
          : true;
      if (shouldGetMoreFromServer) {
        // Get more posts from server
        mainLogger.debug(
          TAG,
          'getPostsByGroupId() db is not exceed limit, request from server',
        );
        do {
          const validAnchorPost = _.findLast(
            result.posts,
            (p: Post) => p.id > 0,
          ); // TODO to check the order for newer/older
          const validAnchorPostId = validAnchorPost
            ? validAnchorPost.id
            : postId;
          const serverResult = await this.fetchPaginationPosts({
            groupId,
            direction,
            limit,
            postId: validAnchorPostId,
          });
          // Just the get posts request is failed will break this loop
          if (!serverResult) {
            break;
          }
          const transformedData = ([] as Raw<Post>[])
            .concat(serverResult.posts)
            .map((item: Raw<Post>) => transform<Post>(item));
          if (shouldSaveToDb) {
            await this._handlePreInsertPosts(transformedData);
          }
          const posts: Post[] =
            (await baseHandleData(transformedData, shouldSaveToDb)) || [];
          const items = (await itemHandleData(serverResult.items)) || [];

          result.posts.push(posts);
          result.items.push(items);
          result.hasMore = serverResult.hasMore;

          if (shouldSaveToDb) {
            await groupConfigDao.update({
              id: groupId,
              [`has_more_${direction}`]: serverResult.hasMore,
            });
          }
        } while (false);
      } else {
        result.hasMore = false;
      }
    }
    result.limit = limit;
    return result;
  }

  private async _isPostInDb(postId: number): Promise<boolean> {
    const post = await this.sourceEntityController.getEntityLocally(postId);
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

    // if (await !GroupService.getInstance().hasPostsInGroup(groupId)) {
    //   return result;
    // }

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

  private async _handlePreInsertPosts(posts: Post[]) {
    if (!posts || !posts.length) {
      return [];
    }
    const ids = posts
      .filter((post: Post) => {
        return this._postStatusHandler.isInPreInsert(post.id);
      })
      .map((post: Post) => post.id);

    if (ids.length) {
      const postDao = daoManager.getDao(PostDao);
      await postDao.bulkDelete(ids);
    }
    return ids;
  }
}

export { PostFetchController };
