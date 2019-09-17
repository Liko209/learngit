/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-22 09:41:52
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation/log';
import { daoManager, DeactivatedDao, QUERY_DIRECTION } from '../../../dao';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { Raw } from '../../../framework/model';
import { ENTITY, SERVICE } from '../../../service/eventKey';
import notificationCenter from '../../../service/notificationCenter';
import { baseHandleData, transform } from '../../../service/utils';
import { IPreInsertController } from '../../common/controller/interface/IPreInsertController';
import { ItemService } from '../../item';
import {
  INDEX_POST_MAX_SIZE,
  LOG_INDEX_DATA_POST,
  LOG_FETCH_POST,
} from '../constant';
import { PostDao, PostDiscontinuousDao } from '../dao';
import { IRawPostResult, Post } from '../entity';
import { IGroupService } from '../../group/service/IGroupService';

import { SortUtils } from '../../../framework/utils';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { ChangeModel } from '../../sync/types';
import { GroupService } from '../../group';
import { AccountService } from 'sdk/module/account';
import { POST_PERFORMANCE_KEYS } from '../config/performanceKeys';
import { IGroupConfigService } from 'sdk/module/groupConfig';
import { PerformanceTracer } from 'foundation/performance';

class PostDataController {
  private queue = Promise.resolve();
  constructor(
    private _groupService: IGroupService,
    private _groupConfigService: IGroupConfigService,
    public preInsertController: IPreInsertController,
    public entitySourceController: IEntitySourceController<Post>,
  ) {}

  async handleFetchedPosts(data: IRawPostResult, shouldSaveToDb: boolean) {
    mainLogger.info(LOG_FETCH_POST, 'handleFetchedPosts()');
    const performanceTracer = PerformanceTracer.start();
    const transformedData = this.transformData(data.posts);
    if (shouldSaveToDb) {
      this.deletePreInsertPosts(transformedData);
    }
    const values = await Promise.all([
      this.filterAndSavePosts(transformedData, shouldSaveToDb),
      ServiceLoader.getInstance<ItemService>(
        ServiceConfig.ITEM_SERVICE,
      ).handleIncomingData(data.items),
    ]);
    const posts: Post[] = values[0] || [];
    const items = values[1] || [];
    performanceTracer.end({
      key: POST_PERFORMANCE_KEYS.CONVERSATION_HANDLE_DATA_FROM_SERVER,
      count: posts.length,
    });
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
  async handleIndexPosts(
    data: Raw<Post>[],
    maxPostsExceed: boolean,
    changeMap?: Map<string, ChangeModel>,
  ) {
    if (data.length) {
      let posts = this.transformData(data);
      this._handleModifiedDiscontinuousPosts(
        posts.filter((post: Post) => post.created_at !== post.modified_at),
      );
      const result = await this.handelPostsOverThreshold(posts, maxPostsExceed);
      posts = await this.handleIndexModifiedPosts(posts);
      this.deletePreInsertPosts(posts);
      mainLogger.info(
        LOG_INDEX_DATA_POST,
        `filterAndSavePosts() before posts.length: ${posts && posts.length}`,
      );
      posts = await this.filterAndSavePosts(posts, true, changeMap);
      mainLogger.info(
        LOG_INDEX_DATA_POST,
        `filterAndSavePosts() after posts.length: ${posts && posts.length}`,
      );
      if (result && result.deleteMap.size > 0) {
        result.deleteMap.forEach((value: number[], key: number) => {
          this._groupService.updateHasMore(key, QUERY_DIRECTION.OLDER, true);
          if (changeMap) {
            changeMap.set(`${ENTITY.FOC_RELOAD}.${key}`, { entities: value });
          } else {
            notificationCenter.emit(`${ENTITY.FOC_RELOAD}.${key}`, value);
          }
        });
      }
      return posts;
    }
    return [];
  }

  /**
   * 1, handleSexioModifiedPosts
   * 2, handlePreInsert
   * 3, filterAndSavePosts
   */
  async handleSexioPosts(data: Post[]) {
    if (data.length) {
      this._handleModifiedDiscontinuousPosts(
        data.filter((post: Post) => post.created_at !== post.modified_at),
      );
      const posts = await this.handleSexioModifiedPosts(data);
      const result = await this.filterAndSavePosts(posts, true);
      this.deletePreInsertPosts(posts);
      return result;
    }
    return [];
  }

  private _filterPreInsertPosts(posts: Post[]) {
    let groupPosts: { [groupId: number]: Post[] } = {};
    if (posts && posts.length) {
      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      const currentUserId = userConfig.getGlipUserId() as number;
      const myPosts = posts.filter(
        (post: Post) => post.creator_id === currentUserId,
      );
      groupPosts = this._getGroupedPosts(myPosts);
    }
    return groupPosts;
  }

  private _getGroupedPosts(posts: Post[]) {
    const groupPosts: { [groupId: number]: Post[] } = {};
    posts.forEach((post: Post) => {
      groupPosts[post.group_id]
        ? groupPosts[post.group_id].push(post)
        : (groupPosts[post.group_id] = [post]);
    });
    return groupPosts;
  }

  async deletePreInsertPosts(posts: Post[]) {
    this.queue = this.queue.then(async () => {
      try {
        const preInsertGroupsPosts = this._filterPreInsertPosts(posts);
        const groupIds = Object.keys(preInsertGroupsPosts);
        await Promise.all(
          groupIds.map(async (groupId: string) => {
            const rawPosts = preInsertGroupsPosts[groupId];
            const ids: number[] = [];
            const preInsertPosts: Post[] = [];
            rawPosts.forEach((post: Post) => {
              const id = this.preInsertController.getPreInsertId(
                post.unique_id,
              );
              if (id) {
                ids.push(id);
                preInsertPosts.push(post);
              }
            });
            await this._groupConfigService.deletePostIds(Number(groupId), ids);
            preInsertPosts.length &&
              this.preInsertController.bulkDelete(preInsertPosts);
          }),
        );
      } catch (error) {
        mainLogger.info(
          LOG_INDEX_DATA_POST,
          `_handlePreInsert() preInsertController.bulkDelete error ${JSON.stringify(
            error,
          )}`,
        );
      }
    });
    return this.queue;
  }

  /**
   * For bookmark/@mentions/pin post/reply
   */
  private async _handleModifiedDiscontinuousPosts(posts: Post[]) {
    if (!posts || !posts.length) {
      mainLogger.info(
        '_handleModifiedDiscontinuousPosts() return directly due to not posts',
      );
      return;
    }
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
      LOG_INDEX_DATA_POST,
      `handelPostsOverThreshold() maxPostsExceed: ${maxPostsExceed} transformedData.length: ${
        posts.length
      }`,
    );
    if (maxPostsExceed || posts.length >= INDEX_POST_MAX_SIZE) {
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
        let deletePostIds: number[] = [];
        const deleteMap: Map<number, number[]> = new Map();
        // TODO Need to refactor db interface to support delete by where
        // Will do this refactor after jerry refactor the dao layer
        await Promise.all(
          shouldRemoveGroupIds.map(async (id: number) => {
            const postIds = await daoManager
              .getDao(PostDao)
              .queryPostIdsByGroupId(id);
            if (postIds.length > 0) {
              deletePostIds = deletePostIds.concat(postIds);
              deleteMap.set(id, postIds);
              mainLogger.info(
                LOG_INDEX_DATA_POST,
                `handelPostsOverThreshold() groupId:${id}, deletePostIds(start-end): ${
                  deletePostIds[0]
                } - ${deletePostIds[deletePostIds.length - 1]}, length:${
                  deletePostIds.length
                }`,
              );
            }
          }),
        );
        if (deletePostIds.length > 0) {
          try {
            await this.entitySourceController.bulkDelete(deletePostIds);
          } catch (error) {
            mainLogger.info(
              LOG_INDEX_DATA_POST,
              `handelPostsOverThreshold bulkDelete failed ${JSON.stringify(
                error,
              )}`,
            );
          }
        }
        return { deleteMap };
      }
    }
    return undefined;
  }

  protected async handleIndexModifiedPosts(posts: Post[]) {
    if (!posts || !posts.length) {
      mainLogger.info(
        LOG_INDEX_DATA_POST,
        'handleIndexModifiedPosts() posts empty',
      );
      return posts;
    }
    mainLogger.info(
      LOG_INDEX_DATA_POST,
      `handleIndexModifiedPosts() posts.length: ${posts.length}`,
    );
    const groupPosts: { [groupId: number]: Post[] } = this._getGroupedPosts(
      posts,
    );
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

  filterFunc = (data: Post[]): { eventKey: string; entities: Post[] }[] => {
    const postGroupMap: Map<
      number,
      { eventKey: string; entities: Post[] }
    > = new Map();
    data.forEach((post: Post) => {
      if (post) {
        const itemInMap = postGroupMap.get(post.group_id);
        if (itemInMap) {
          itemInMap.entities.push(post);
        } else {
          postGroupMap.set(post.group_id, {
            eventKey: `${ENTITY.POST}.${post.group_id}`,
            entities: [post],
          });
        }
      }
    });

    return Array.from(postGroupMap.values());
  };

  async filterAndSavePosts(
    posts: Post[],
    save: boolean,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<Post[]> {
    if (!posts || !posts.length) {
      return posts;
    }

    const postDao = daoManager.getDao(PostDao);
    const normalPosts = await baseHandleData(
      {
        changeMap,
        data: posts,
        dao: postDao,
        eventKey: ENTITY.POST,
        noSavingToDB: !save,
      },
      this.filterFunc,
    );

    // check if post's owner group exist in local or not
    // seems we only need check normal posts, don't need to check deactivated data
    await this._ensureGroupExist(normalPosts);
    return normalPosts;
  }

  postCreationTimeSortingFn = (lhs: Post, rhs: Post) =>
    SortUtils.sortModelByKey(lhs, rhs, ['created_at'], false);

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
          const oldestPost = await postDao.queryOldestPostCreationTimeByGroupId(
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

              mainLogger.info(
                LOG_INDEX_DATA_POST,
                `oldestPost.id ${
                  oldestPost.id
                } editedNewestPostCreationTime:${editedNewestPostCreationTime} groupId:${groupId}`,
              );
            });
            posts.forEach((post: Post) => {
              if (post.created_at <= editedNewestPostCreationTime) {
                deleteGroupIdSet.add(groupId);
                deletePostIds.push(post.id);
              }
            });
          } else {
            const sortedPost = posts.sort(this.postCreationTimeSortingFn);
            const index = sortedPost.findIndex(
              (post: Post) => post.created_at === post.modified_at,
            );
            if (index !== -1) {
              const deletePosts = sortedPost.slice(0, index);
              deleteGroupIdSet.add(groupId);
              deletePostIds.concat(deletePosts.map((post: Post) => post.id));
            }
          }
          const postIds = posts && posts.map(post => post.id);
          mainLogger.info(
            LOG_INDEX_DATA_POST,
            `removeDiscontinuousPosts() remove groupId: ${groupId}, deletePostIds: ${deletePostIds}, postIds:${postIds}`,
          );
        }
      }),
    );
    if (deleteGroupIdSet.size > 0) {
      // mark group has more as true
      notificationCenter.emit(
        SERVICE.POST_SERVICE.MARK_GROUP_HAS_MORE_ODER_AS_TRUE,
        [...deleteGroupIdSet],
        QUERY_DIRECTION.OLDER,
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
      const notExistedGroups: number[] = [];
      const groupService = this._groupService as GroupService;
      posts.forEach((post: Post) => {
        const group = groupService.getSynchronously(post.group_id);
        if (!group) {
          notExistedGroups.push(post.group_id);
        }
      });

      if (notExistedGroups.length) {
        mainLogger.info(
          LOG_INDEX_DATA_POST,
          `_ensureGroupExist() notExistedGroups.length: ${
            notExistedGroups.length
          }`,
        );
        try {
          await groupService.batchGet(notExistedGroups);
        } catch (error) {
          mainLogger
            .tags('PostDataController')
            .info('get group error =', error);
        }
      }
    }
  }

  transformData(data: Raw<Post>[] | Raw<Post>): Post[] {
    return ([] as Raw<Post>[])
      .concat(data)
      .map((item: Raw<Post>) => transform<Post>(item));
  }
}

export { PostDataController };
