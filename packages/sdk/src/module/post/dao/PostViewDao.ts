/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-10 17:20:05
 * Copyright © RingCentral. All rights reserved.
 */
import { IDatabase } from 'foundation/db';
import { mainLogger } from 'foundation/log';
import _ from 'lodash';
import { BaseDao } from '../../../framework/dao';
import { Post, PostView, UnreadPostQuery } from '../entity';
import { QUERY_DIRECTION } from '../../../dao/constants';
import { DEFAULT_PAGE_SIZE, LOG_FETCH_POST } from '../constant';
import { ArrayUtils } from '../../../utils/ArrayUtils';
import { IViewDao } from 'sdk/module/base/dao/IViewDao';

class PostViewDao extends BaseDao<PostView>
  implements IViewDao<number, Post, PostView> {
  static COLLECTION_NAME = 'postView';
  protected idsMap: Map<number, number[]>;

  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(PostViewDao.COLLECTION_NAME, db);
  }

  async put(postView: PostView): Promise<void> {
    this._updateIds([postView]);
    return super.put(postView);
  }

  async bulkPut(postViews: PostView[]): Promise<void> {
    this._updateIds(postViews);
    return super.bulkPut(postViews);
  }

  private _updateIds(updatePostViews: PostView[]) {
    if (this.idsMap) {
      updatePostViews.forEach((view: PostView) => {
        const ids = this.idsMap.get(view.group_id);
        if (ids) {
          if (ids.length === 0  || ids[ids.length - 1] < view.id) {
            ids.push(view.id);
          } else {
            for (let i = 0; i < ids.length; i++) {
              if (ids[i] === view.id) {
                break;
              }
              if (ids[i] > view.id) {
                i > 0 && ids.splice(i, 0, view.id);
                break;
              }
            }
          }
        }
      })
    }
  }

  toViewItem(entity: Post): PostView {
    return {
      id: entity.id,
      group_id: entity.group_id,
      created_at: entity.created_at,
    };
  }

  toPartialViewItem(partialEntity: Partial<Post>): Partial<PostView> {
    return _.pickBy(
      {
        id: partialEntity.id,
        group_id: partialEntity.group_id,
        created_at: partialEntity.created_at,
      },
      _.identity,
    );
  }

  getCollection() {
    return this.getDb().getCollection<PostView, number>(
      PostViewDao.COLLECTION_NAME,
    );
  }

  async queryPostsByGroupId(
    fetchPostFunc: (ids: number[]) => Promise<Post[]>,
    groupId: number,
    anchorPostId?: number,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.OLDER,
    limit: number = Infinity,
  ): Promise<Post[]> {
    const start = performance.now();
    let anchorPost;
    let postIds;
    if (anchorPostId) {
      anchorPost = await this.get(anchorPostId);
      if (!anchorPost) {
        mainLogger.info(
          LOG_FETCH_POST,
          `queryPostsByGroupId() return [] for groupId:${groupId} anchorPostId:${anchorPostId} direction:${direction} limit:${limit}`,
        );
        return [];
      }
      // 1. Get ids from post lookup table via group id
      postIds = await this.queryPostIdsByGroupId(groupId);
    } else {
      if (!this.idsMap) {
        this.idsMap = new Map<number, number[]>();
        await this.initialPostIds();
      }
      postIds = this.idsMap.get(groupId) || await this.queryPostIdsByGroupId(groupId);
      if (!postIds.length) {
        return [];
      }
    }

    // 2. If post id > 0, calculate the startIndex & endIndex via direction, else limit is the endIndex
    postIds = ArrayUtils.sliceIdArray(
      postIds,
      limit === Infinity ? DEFAULT_PAGE_SIZE : limit,
      anchorPostId,
      direction,
    );
    const end = performance.now();
    mainLogger.info(
      LOG_FETCH_POST,
      `queryPostsByGroupId() from postView ${end - start}, groupId:${groupId}`,
      postIds.length,
    );

    // 3. Get posts via ids from post table
    const posts = await fetchPostFunc(postIds);
    mainLogger.info(
      LOG_FETCH_POST,
      `queryPostsByGroupId() via ids from post ${performance.now() -
      end}, groupId:${groupId}`,
      posts.length,
    );
    return posts;
  }

  async queryUnreadPostsByGroupId(
    fetchPostFunc: (ids: number[]) => Promise<Post[]>,
    { groupId, startPostId, endPostId }: UnreadPostQuery,
  ): Promise<Post[]> {
    let postIds = await this.queryPostIdsByGroupId(groupId);
    const realStartPostId = startPostId
      ? _.findLast(postIds, (id: number) => id < startPostId) || 0
      : 0;
    postIds = postIds.filter(
      (id: number) => id >= realStartPostId && id <= endPostId,
    );
    return fetchPostFunc(postIds);
  }

  async queryPostIdsByGroupId(groupId: number): Promise<number[]> {
    const postViews = await this.queryPostByGroupId(groupId);
    return postViews.map(postView => postView.id);
  }

  async initialPostIds(): Promise<void> {
    const postViews = await this.getAll();
    for (let i = postViews.length - 1; i >= 0; i--) {
      const ids = this.idsMap.get(postViews[i].group_id);
      if (ids) {
        ids.length < DEFAULT_PAGE_SIZE && ids.unshift(postViews[i].id);
      } else {
        this.idsMap.set(postViews[i].group_id, [postViews[i].id]);
      }
    }
  }

  async queryPostByGroupId(groupId: number): Promise<PostView[]> {
    const query = this.createQuery().equal('group_id', groupId);
    const postViews = await query.toArray();
    return _.orderBy(postViews, 'created_at', 'asc');
  }
}
export { PostViewDao };
