import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { IRequestController } from '../../../framework/controller/interface/IRequestController';
import { Post, IPostQuery, IPostResult } from '../entity';
import { QUERY_DIRECTION } from '../../../dao/constants';
import { daoManager, PostDao } from '../../../dao';
import { mainLogger } from 'foundation';
import { ItemService } from '../../item/service/ItemService';
import _ from 'lodash';

/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-17 15:30:09
 * Copyright © RingCentral. All rights reserved.
 */
const DEFAULT_PAGE_SIZE = 20;
const TAG = 'PostFetchController';

class PostFetchController {
  constructor(
    public requestController: IRequestController<Post>,
    public sourceEntityController: IEntitySourceController<Post>,
  ) {}

  async getPostsByGroupId({
    groupId,
    postId = 0,
    limit = DEFAULT_PAGE_SIZE,
    direction = QUERY_DIRECTION.OLDER,
  }: IPostQuery): Promise<IPostResult> {
    const shouldSaveToDb = postId === 0 || (await this._isPostInDb(postId));
    mainLogger.info(
      `PostDataHandler getPostsByGroupId() postId: ${postId} shouldSaveToDb ${shouldSaveToDb} direction ${direction}`,
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
          `getPostsByGroupId groupId:${groupId} postId:${postId} limit:${limit} direction:${direction} no data in local DB, should do request`,
        );
        do {
          const validAnchorPost = _.findLast(
            result.posts,
            (p: Post) => p.id > 0,
          ); // TODO to check the order for newer/older
          const validAnchorPostId = validAnchorPost
            ? validAnchorPost.id
            : postId;
          const serverResult = await this._requestHandler.fetchPaginationPosts({
            groupId,
            direction,
            limit,
            postId: validAnchorPostId,
          });
          // Just the get posts request is failed will break this loop
          if (!serverResult) {
            break;
          }
          const transformedData = transformData(serverResult.posts);
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
}

export { PostFetchController };
