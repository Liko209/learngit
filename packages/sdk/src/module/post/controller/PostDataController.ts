/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-22 09:41:52
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation';
import _ from 'lodash';
import { daoManager, DeactivatedDao } from '../../../dao';
import { PostDao, PostDiscontinuousDao } from '../dao';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { Raw } from '../../../framework/model';
import { ENTITY, notificationCenter, SERVICE } from '../../../service';
import { baseHandleData, transform } from '../../../service/utils';
import { IPreInsertController } from '../../common/controller/interface/IPreInsertController';
import { ItemService } from '../../item';
import { INDEX_POST_MAX_SIZE } from '../constant';
import { IRawPostResult, Post } from '../entity';
import { GroupService } from '../../group';

const TAG = 'PostDataController';

class PostDataController {
  constructor(
    public preInsertController: IPreInsertController,
    public entitySourceController: IEntitySourceController<Post>,
  ) {}

  async handleFetchedPosts(data: IRawPostResult, shouldSaveToDb: boolean) {
    const transformedData = this.transformData(data.posts);
    if (shouldSaveToDb) {
      await this.preInsertController.bulkDelete(transformedData);
    }
    const posts: Post[] =
      (await this.filterAndSavePosts(transformedData, shouldSaveToDb)) || [];
    const items =
      (await ItemService.getInstance<ItemService>().handleIncomingData(
        data.items,
      )) || [];
    return {
      posts,
      items,
      hasMore: data.hasMore,
    };
  }

  /**
   * 1, handelPostsOverThreshold
   * 2, handleModifiedPosts
   * 3, handlePreInsert
   * 4, filterAndSavePosts
   */
  async handleIndexPosts(data: Raw<Post>[], maxPostsExceed: boolean) {
    if (data.length) {
      let posts = this.transformData(data);
      this._handleMDDiscontinuousPosts(
        posts.filter(
          (post: Post) =>
            post.created_at !== post.modified_at || post.deactivated,
        ),
      );
      await this.handelPostsOverThreshold(posts, maxPostsExceed);
      await this.preInsertController.bulkDelete(posts);
      posts = await this.handleIndexModifiedPosts(posts);
      return await this.filterAndSavePosts(posts, true);
    }
    return [];
  }

  /**
   * 1, handleSexioModifiedPosts
   * 2, handlePreInsert
   * 3, filterAndSavePosts
   */
  async handleSexioPosts(data: Raw<Post>[]) {
    if (data.length) {
      let posts = this.transformData(data);
      this._handleModifiedDiscontinuousPosts(
        posts.filter((post: Post) => post.created_at !== post.modified_at),
      );
      posts = await this.handleSexioModifiedPosts(posts);
      await this.preInsertController.bulkDelete(posts);
      return await this.filterAndSavePosts(posts, true);
    }
    return data;
  }

  /**
   * For bookmark/@mentions/pin post/reply
   */
  private async _handleModifiedDiscontinuousPosts(posts: Post[]) {
    const postDiscontinuousDao = daoManager.getDao(PostDiscontinuousDao);
    const deactivatedPosts: Post[] = [];
    const normalPosts: Post[] = [];
    posts.forEach((post: Post) => {
      post.deactivated ? deactivatedPosts.push(post) : normalPosts.push(post);
    });
    if (deactivatedPosts.length > 0) {
      await Promise.all([
        daoManager.getDao(DeactivatedDao).bulkPut(deactivatedPosts),
        postDiscontinuousDao.bulkDelete(
          deactivatedPosts.map((post: Post) => post.id),
        ),
      ]);
    }
    if (normalPosts.length > 0) {
      await postDiscontinuousDao.bulkUpdate(normalPosts, false);
    }
    notificationCenter.emitEntityUpdate(ENTITY.DISCONTINUOUS_POST, posts);
  }

  /**
   * 1, Calculate every group's post count
   * 2, If group's post count > 50, delete all posts of this group in db
   *    If group's post count < 50, do nothing
   * Note: Keep the server return posts, just delete posts in db
   */
  protected async handelPostsOverThreshold(
    posts: Post[],
    maxPostsExceed: boolean,
  ) {
    mainLogger.info(
      TAG,
      `maxPostsExceed: ${maxPostsExceed} transformedData.length: ${
        posts.length
      }`,
    );
    if (maxPostsExceed && posts.length >= INDEX_POST_MAX_SIZE) {
      const groupPostsNumber: { [groupId: number]: number[] } = {};
      posts.forEach((post: Post) => {
        groupPostsNumber[post.group_id]
          ? groupPostsNumber[post.group_id].push(post.id)
          : (groupPostsNumber[post.group_id] = [post.id]);
      });
      const shouldRemoveGroupIds: number[] = [];
      const groupIds = Object.keys(groupPostsNumber);
      groupIds.forEach((groupId: string) => {
        if (groupPostsNumber[groupId].length >= INDEX_POST_MAX_SIZE) {
          shouldRemoveGroupIds.push(Number(groupId));
        }
      });
      if (shouldRemoveGroupIds.length) {
        let deleteIds: number[] = [];
        // TODO Need to refactor db interface to support delete by where
        // Will do this refactor after jerry refactor the dao layer
        await Promise.all(
          shouldRemoveGroupIds.map(async (id: number) => {
            const postIds = await daoManager
              .getDao(PostDao)
              .queryPostIdsByGroupId(id);
            deleteIds = deleteIds.concat(postIds);
          }),
        );
        if (deleteIds.length) {
          this.entitySourceController.bulkDelete(deleteIds);
        }
      }
    }
    return posts;
  }

  protected async handleIndexModifiedPosts(posts: Post[]) {
    if (!posts || !posts.length) {
      return posts;
    }
    const groupPosts: { [groupId: number]: Post[] } = {};
    posts.forEach((post: Post) => {
      groupPosts[post.group_id]
        ? groupPosts[post.group_id].push(post)
        : (groupPosts[post.group_id] = [post]);
    });

    const removedIds = await this.removeDiscontinuousPosts(groupPosts);
    const resultPosts = posts.filter(
      (post: Post) => !removedIds.includes(post.id),
    );
    return resultPosts;
  }

  protected async handleSexioModifiedPosts(posts: Post[]) {
    return posts.filter(
      (post: Post) =>
        post.created_at === post.modified_at ||
        this.entitySourceController.getEntityLocally(post.id),
    );
  }

  async filterAndSavePosts(posts: Post[], save: boolean): Promise<Post[]> {
    if (!posts || !posts.length) {
      return posts;
    }
    const groups = _.groupBy(posts, 'group_id');
    const postDao = daoManager.getDao(PostDao);
    const normalPosts = _.flatten(
      await Promise.all(
        Object.values(groups).map(async (posts: Post[]) => {
          const normalPosts = await baseHandleData({
            data: posts,
            dao: postDao,
            eventKey: ENTITY.POST,
            noSavingToDB: !save,
          });
          return normalPosts;
        }),
      ),
    );
    // check if post's owner group exist in local or not
    // seems we only need check normal posts, don't need to check deactivated data
    await this._ensureGroupExist(normalPosts);
    return normalPosts;
  }

  /**
   * 1, Check whether the group has discontinues post,
   *    the condition is the modification time is different with the creation time;
   * 2, Group has post in local db, need compare the new posts creation time with oldest time
   *    to decide whether discard them;
   * 1),Earlier than oldest post, need discard;
   * 2),Remove all posts which creation time older than edited newest post's creation time;
   * 3, Group has no posts in local data base, should discard all posts
   */
  protected async removeDiscontinuousPosts(groupPosts: {
    [groupId: number]: Post[];
  }): Promise<number[]> {
    const groupIds = Object.keys(groupPosts);
    const postDao = daoManager.getDao(PostDao);

    const deleteGroupIdSet = new Set();
    const deletePostIds: number[] = [];
    await Promise.all(
      groupIds.map(async (groupId: string) => {
        const posts: Post[] = groupPosts[groupId];
        if (this._isGroupPostsDiscontinuous(posts)) {
          const oldestPost = await postDao.queryOldestPostByGroupId(
            Number(groupId),
          );
          let editedNewestPostCreationTime = -1;
          if (oldestPost) {
            posts.forEach((post: Post) => {
              if (
                post.created_at !== post.modified_at &&
                post.created_at < oldestPost.created_at
              ) {
                deleteGroupIdSet.add(groupId);
                deletePostIds.push(post.id);
                if (post.created_at > editedNewestPostCreationTime) {
                  editedNewestPostCreationTime = post.created_at;
                }
              }
            });
            posts.forEach((post: Post) => {
              if (post.created_at <= editedNewestPostCreationTime) {
                deleteGroupIdSet.add(groupId);
                deletePostIds.push(post.id);
              }
            });
          } else {
            // If do the message preview feature, should modify this code
            deleteGroupIdSet.add(groupId);
            deletePostIds.concat(posts.map((post: Post) => post.id));
          }
        }
      }),
    );

    if (deleteGroupIdSet.size > 0) {
      // mark group has more as true
      notificationCenter.emit(
        SERVICE.POST_SERVICE.MARK_GROUP_HAS_MORE_ODER_AS_TRUE,
        [...deleteGroupIdSet],
      );
      return deletePostIds;
    }
    return [];
  }

  private _isGroupPostsDiscontinuous(posts: Post[]) {
    for (let i = 0; i < posts.length; i++) {
      if (
        posts[i].modified_at &&
        posts[i].created_at !== posts[i].modified_at
      ) {
        return true;
      }
    }
    return false;
  }

  private async _ensureGroupExist(posts: Post[]): Promise<void> {
    if (posts.length) {
      posts.forEach(async (post: Post) => {
        const groupService: GroupService = GroupService.getInstance();
        try {
          await groupService.getById(post.group_id);
        } catch (error) {
          mainLogger
            .tags('PostDataController')
            .info(`get group ${post.group_id} fail`, error);
        }
      });
    }
  }

  transformData(data: Raw<Post>[] | Raw<Post>): Post[] {
    return ([] as Raw<Post>[])
      .concat(data)
      .map((item: Raw<Post>) => transform<Post>(item));
  }
}

export { PostDataController };
