/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-23 18:25:27
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import moment from 'moment';
import { observable, computed, transaction } from 'mobx';
import { Post } from 'sdk/models';
import { ISortableModel } from '@/store/base';
import { DateSeparator, SeparatorType } from './types';
import { ISeparatorHandler } from './ISeparatorHandler';
import { QUERY_DIRECTION } from 'sdk/dao';

class DateSeparatorHandler implements ISeparatorHandler {
  priority: number = 1;

  @observable
  postsByDateMap: Map<number, ISortableModel<Post>[]> = new Map();

  // _separatorMap: Map<number, DateSeparator> = new Map();

  @computed
  get separatorMap() {
    const resultMap = new Map<number, DateSeparator>();
    this.postsByDateMap.forEach(
      (posts: ISortableModel<Post>[], timestamp: number) => {
        const firstPost = _.first(posts);
        if (!firstPost) return;

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
    transaction(() => {
      _(addedPosts)
        .reverse()
        .forEach((post: ISortableModel<Post>) => {
          if (post.data) {
            const timestamp = moment(post.data.created_at)
              .startOf('day')
              .valueOf();
            const posts = this.postsByDateMap.get(timestamp) || [];
            if (posts) {
              posts.push(post);
            }
            this.postsByDateMap.set(timestamp, _.sortBy(posts, 'id'));
          }
        });
    });
  }

  onDeleted(deletedPostIds: number[], allPosts: ISortableModel<any>[]): void {
    transaction(() => {
      deletedPostIds.forEach((deletedPostId: number) => {
        this.postsByDateMap.forEach(
          (posts: ISortableModel[], timestamp: number) => {
            const newPosts = _.filter(posts, post => post.id !== deletedPostId);
            if (newPosts.length > 0) {
              this.postsByDateMap.set(timestamp, newPosts);
            } else {
              this.postsByDateMap.delete(timestamp);
            }
          },
        );
      });
    });
  }
}

export { DateSeparatorHandler };
