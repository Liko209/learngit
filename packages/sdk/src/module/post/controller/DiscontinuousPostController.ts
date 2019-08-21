/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-02-26 13:41:05
 * Copyright © RingCentral. All rights reserved.
 */
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { Post } from '../entity';
import { Item } from '../../item/entity';
import { ItemService } from '../../item';
import PostAPI from '../../../api/glip/post';
import { Raw } from '../../../framework/model';
import { transform } from '../../../service/utils';
import _ from 'lodash';
import { daoManager, DeactivatedDao } from '../../../dao';
import { PostDao } from '../dao';
import { mainLogger } from 'foundation/log';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';

const LOG_TAG = '[DiscontinuousPostController]';
class DiscontinuousPostController {
  constructor(public entitySourceController: IEntitySourceController<Post>) {}

  /**
   * 1, Get posts from discontinuous post table firstly(include deactivated posts)
   * 2, If not get all posts, get the remaining posts from post table
   * 3, If not get all posts, get the remaining posts from server
   * 4, If still have posts not get, mock deactivated posts for not get posts
   * 5, Save server's & mock posts into db
   */
  async getPostsByIds(
    ids: number[],
  ): Promise<{ posts: Post[]; items: Item[] }> {
    mainLogger.tags(LOG_TAG).info('getPostsByIds()');
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    const validIds = ids.filter(
      (id: number) => id !== null && id !== undefined,
    );
    const localPosts = await this._getPostFromLocal(validIds);
    const result = {
      posts: localPosts,
      items: await itemService.getByPosts(localPosts),
    };

    const restIds = _.difference(validIds, localPosts.map(({ id }) => id));
    if (restIds.length) {
      mainLogger.tags(LOG_TAG).info('getPostsByIds() get from server');
      const remoteData = await PostAPI.requestByIds(restIds);
      let remotePosts: Post[] = remoteData.posts.map((item: Raw<Post>) =>
        transform<Post>(item),
      );

      const notAchievedIds = _.difference(
        restIds,
        remotePosts.map(({ id }) => id),
      );
      if (notAchievedIds.length > 0) {
        remotePosts.push(...this._mockDeactivatedPosts(notAchievedIds));
      }

      remotePosts = await this._savePosts(remotePosts);

      const itemService = ServiceLoader.getInstance<ItemService>(
        ServiceConfig.ITEM_SERVICE,
      );
      const items =
        (await itemService.handleIncomingData(remoteData.items)) || [];
      result.posts.push(...remotePosts);
      result.items.push(...items);
    }
    mainLogger
      .tags(LOG_TAG)
      .info(
        'getPostsByIds() done, ids size:',
        ids.length,
        'result size:',
        result.posts && result.posts.length,
      );
    return result;
  }

  /**
   * 1, Get posts from discontinuous post table firstly(include deactivated posts)
   * 2, If not get all posts, get the remaining posts from post table
   */
  private async _getPostFromLocal(ids: number[]): Promise<Post[]> {
    const discontinuousPosts = await this.entitySourceController.getEntitiesLocally(
      ids,
      true,
    );
    const surplusIds = _.difference(
      ids,
      discontinuousPosts.map(({ id }) => id),
    );
    if (surplusIds.length > 0) {
      const surplusPosts = await daoManager
        .getDao(PostDao)
        .batchGet(surplusIds);
      discontinuousPosts.push(...surplusPosts);
    }
    return discontinuousPosts;
  }

  private _mockDeactivatedPosts(ids: number[]): Post[] {
    mainLogger.info('_mockDeactivatedPosts ids:', ids);
    return ids.map((id: number) => ({ id, deactivated: true } as Post));
  }

  private async _savePosts(posts: Post[]): Promise<Post[]> {
    const deactivatedPosts: Post[] = [];
    const normalPosts: Post[] = [];
    posts.forEach((post: Post) => {
      post.deactivated ? deactivatedPosts.push(post) : normalPosts.push(post);
    });
    if (normalPosts.length > 0) {
      await this.entitySourceController.bulkUpdate(normalPosts);
    }
    if (deactivatedPosts.length > 0) {
      await daoManager.getDao(DeactivatedDao).bulkUpdate(deactivatedPosts);
    }
    return normalPosts;
  }
}

export { DiscontinuousPostController };
