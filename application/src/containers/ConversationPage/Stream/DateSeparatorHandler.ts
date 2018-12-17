/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-23 18:25:27
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import moment from 'moment';
import { observable, computed } from 'mobx';
import { Post } from 'sdk/models';
import { ISortableModel } from '@/store/base';
import { DateSeparator, SeparatorType } from './types';
import { ISeparatorHandler } from './ISeparatorHandler';
import { QUERY_DIRECTION } from 'sdk/dao';

class DateSeparatorHandler implements ISeparatorHandler {
  priority: number = 1;

  @observable
  private _postsByDateMap: Map<number, ISortableModel<Post>[]> = new Map();

  private _oldestPost?: ISortableModel<Post>;

  @computed
  get separatorMap() {
    const resultMap = new Map<number, DateSeparator>();
    this._postsByDateMap.forEach(
      (posts: ISortableModel<Post>[], timestamp: number) => {
        const firstPost = _.first(posts);
        if (!firstPost) return;
        if (this._oldestPost && firstPost.id === this._oldestPost.id) return;
        resultMap.set(firstPost.id, {
          timestamp,
          type: SeparatorType.DATE,
        });
      },
    );
    return resultMap;
  }

  onAdded(
    direction: QUERY_DIRECTION,
    addedPosts: ISortableModel<Post>[],
    allPosts: ISortableModel<Post>[],
  ): void {
    this._oldestPost = _.first(allPosts);
    _(addedPosts)
      .reverse()
      .forEach((post: ISortableModel<Post>) => {
        if (post.data) {
          const timestamp = moment(post.data.created_at)
            .startOf('day')
            .valueOf();
          const posts = this._postsByDateMap.get(timestamp) || [];
          if (posts) {
            posts.push(post);
          }
          this._postsByDateMap.set(timestamp, _.sortBy(posts, 'id'));
        }
      });
  }

  onDeleted(deletedPostIds: number[], allPosts: ISortableModel<any>[]): void {
    deletedPostIds.forEach((deletedPostId: number) => {
      this._postsByDateMap.forEach(
        (posts: ISortableModel[], timestamp: number) => {
          const newPosts = _.filter(posts, post => post.id !== deletedPostId);
          if (newPosts.length > 0) {
            this._postsByDateMap.set(timestamp, newPosts);
          } else {
            this._postsByDateMap.delete(timestamp);
          }
        },
      );
    });
  }
}

export { DateSeparatorHandler };
