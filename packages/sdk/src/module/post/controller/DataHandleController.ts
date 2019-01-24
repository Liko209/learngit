/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-22 09:41:52
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager, PostDao } from '../../../dao';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { IPreInsertController } from '../../../module/common/controller/interface/IPreInsertController';
import { Post, IRawPostResult } from '../entity';
import { Raw } from '../../../framework/model';
import { baseHandleData, transform } from '../../../service/utils';
import { ItemService } from '../../item';
import { ENTITY, GroupService } from '../../../service';
import { Item } from '../../item/entity';
import _ from 'lodash';

class DataHandleController {
  constructor(
    public preInsertController: IPreInsertController,
    public entitySourceController: IEntitySourceController<Post>,
  ) {}

  async handleFetchedPosts(
    data: IRawPostResult | null,
    shouldSaveToDb: boolean,
    updateResult: (posts: Post[], items: Item[]) => void,
  ) {
    if (!data) {
      return;
    }

    const transformedData = this._transformData(data.posts);
    if (shouldSaveToDb) {
      await this.preInsertController.bulkDelete(transformedData);
    }
    const posts: Post[] =
      (await this.filterAndSavePosts(transformedData, shouldSaveToDb)) || [];
    const items =
      (await (ItemService.getInstance() as ItemService).handleIncomingData(
        data.items,
      )) || [];
    await updateResult(posts, items);
  }

  async filterAndSavePosts(posts: Post[], save?: boolean): Promise<Post[]> {
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

  private async _ensureGroupExist(posts: Post[]): Promise<void> {
    if (posts.length) {
      posts.forEach(async (post: Post) => {
        const groupService: GroupService = GroupService.getInstance();
        await groupService.getById(post.group_id);
      });
    }
  }

  private _transformData(data: Raw<Post>[] | Raw<Post>): Post[] {
    return ([] as Raw<Post>[])
      .concat(data)
      .map((item: Raw<Post>) => transform<Post>(item));
  }
}

export { DataHandleController };
