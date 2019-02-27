/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-02-26 13:41:05
 * Copyright © RingCentral. All rights reserved.
 */
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { Post } from '../entity';
import { Item } from '../../../module/item/entity';
import { ItemService } from '../../item';
import PostAPI from '../../../api/glip/post';
import { Raw } from '../../../framework/model';
import { transform } from '../../../service/utils';
import _ from 'lodash';
import { daoManager, DeactivatedDao } from '../../../dao';

class DiscontinuousPostController {
  constructor(public entitySourceController: IEntitySourceController<Post>) {}

  /**
   * 1, Get posts from db firstly(include deactivated posts)
   * 2, If not get all posts, get the remaining posts from server
   * 3, If still have posts not get, mock deactivated posts for not get posts
   * 4, Save server's & mock posts into db
   */
  async getPostsByIds(
    ids: number[],
  ): Promise<{ posts: Post[]; items: Item[] }> {
    const itemService: ItemService = ItemService.getInstance();
    const localPosts = await this.entitySourceController.getEntitiesLocally(
      ids,
      true,
    );
    const result = {
      posts: localPosts.filter((post: Post) => !post.deactivated),
      items: await itemService.getByPosts(localPosts),
    };

    const restIds = _.difference(ids, localPosts.map(({ id }) => id));
    if (restIds.length) {
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

      const itemService = ItemService.getInstance() as ItemService;
      const items =
        (await itemService.handleIncomingData(remoteData.items)) || [];
      result.posts.push(...remotePosts);
      result.items.push(...items);
    }
    return result;
  }

  private _mockDeactivatedPosts(ids: number[]): Post[] {
    return ids.map((id: number) => {
      return { id, deactivated: true } as Post;
    });
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
      daoManager.getDao(DeactivatedDao).bulkUpdate(deactivatedPosts);
    }
    return normalPosts;
  }
}

export { DiscontinuousPostController };
