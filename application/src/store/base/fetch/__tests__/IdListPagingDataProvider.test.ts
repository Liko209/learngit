/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-26 11:24:59
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { IdListPagingDataProvider } from '../IdListPagingDataProvider';
import { IEntityDataProvider } from '../types';

import PostModel from '../../../models/Post';
import { Post } from 'sdk/module/post/entity';
import { IdModel } from 'sdk/src/framework/model';
import { ENTITY } from 'sdk/service/eventKey';
import { ENTITY_NAME } from '@/store/constants';
import notificationCenter from 'sdk/service/notificationCenter';
import storeManager from '@/store/base/StoreManager';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { hasValidEntity } from '@/store/utils';

jest.mock('sdk/service/notificationCenter');

function toIdModel(id: number, deactivated?: boolean, isMocked?: boolean) {
  return {
    id,
    deactivated,
    isMocked,
  };
}

function toIdModels(ids: number[], deactivated?: boolean) {
  return ids.map((id: number) => {
    return {
      id,
      deactivated,
    };
  });
}

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

const transformFunc = (model: IdModel) => ({
  id: model.id,
  sortValue: -model.id,
});

const isMatchFunc = (model: PostModel) => {
  return !model.deactivated;
};

class PostProvider implements IEntityDataProvider<Post> {
  async getByIds(ids: number[]) {
    return [];
  }
}

describe('IdListPagingDataProvider', () => {
  const sourceIds = [5, 6, 7, 8, 9, 10, 11];
  let idsDataProvider: IdListPagingDataProvider<Post, PostModel>;
  let postProvider: PostProvider;
  const eventName = ENTITY.DISCONTINUOUS_POST;
  const entityName = ENTITY_NAME.POST;
  function setUp() {
    postProvider = new PostProvider();
    const options = {
      transformFunc,
      eventName,
      entityName,
      filterFunc: isMatchFunc,
      entityDataProvider: postProvider,
    };
    idsDataProvider = new IdListPagingDataProvider(sourceIds, options);
    const store = storeManager.getEntityMapStore(entityName);
    storeManager.removeStore(store);
  }

  function setUpData(
    existPostIds: number[],
    needFetchPostIds: number[],
    invalidPostIds: number[],
    mockedPostIds: number[],
  ) {
    const existPosts = existPostIds.map((x: number) => {
      return toIdModel(
        x,
        invalidPostIds.includes(x),
        mockedPostIds.includes(x),
      );
    });

    storeManager.dispatchUpdatedDataModels(entityName, existPosts);

    const toFetchPosts = needFetchPostIds.map((x: number) => {
      return toIdModel(x, invalidPostIds.includes(x));
    });

    postProvider.getByIds = jest.fn().mockResolvedValue(toFetchPosts);
  }

  beforeEach(() => {
    clearMocks();
  });

  describe('onSourceIdsChanged', () => {
    beforeEach(() => {
      clearMocks();
      setUp();

      notificationCenter.emitEntityDelete = jest.fn();
      notificationCenter.emitEntityUpdate = jest.fn();
    });

    it.each`
      sourceIds    | newIds                                | updatedIds                   | deletedIds    | cursors
      ${sourceIds} | ${[6, 7, 8, 9, 10]}                   | ${[]}                        | ${[5, 11]}    | ${{ front: 5, end: 11 }}
      ${sourceIds} | ${[4, 5, 6, 7, 8, 9, 10, 11, 12, 13]} | ${[4, 12, 13]}               | ${[]}         | ${{ front: 5, end: 11 }}
      ${sourceIds} | ${[5, 6, 7, 8, 9, 11, 10]}            | ${[5, 6, 7, 8, 9, 11, 10]}   | ${[]}         | ${{ front: 5, end: 11 }}
      ${sourceIds} | ${[5, 7, 6, 11, 10, 15, 16]}          | ${[5, 7, 6, 11, 10]}         | ${[8, 9]}     | ${{ front: 5, end: 9 }}
      ${sourceIds} | ${[5, 7, 6, 11, 15, 8, 16]}           | ${[5, 7, 6, 11, 15, 8]}      | ${[9, 10]}    | ${{ front: 5, end: 9 }}
      ${sourceIds} | ${[11, 7, 6, 11, 15, 16, 5]}          | ${[11, 7, 6, 11, 15, 16, 5]} | ${[8, 9, 10]} | ${{ front: 5, end: 9 }}
    `(
      'should send right notification when source ids changed, new ids: $newIds',
      async ({ sourceIds, newIds, updatedIds, deletedIds, cursors }) => {
        Object.assign(idsDataProvider, { _cursors: cursors });
        postProvider.getByIds = jest
          .fn()
          .mockImplementation((ids: number[]) => {
            return toIdModels(ids);
          });

        idsDataProvider.onSourceIdsChanged(newIds);

        const promise = new Promise((resolve: any, reject: any) => {
          setTimeout(() => {
            resolve();
          },         100);
        });
        await promise;

        if (deletedIds.length > 0) {
          expect(notificationCenter.emitEntityDelete).toBeCalledWith(
            ENTITY.DISCONTINUOUS_POST,
            deletedIds,
          );
        }

        if (updatedIds.length > 0) {
          expect(notificationCenter.emitEntityUpdate).toBeCalledWith(
            ENTITY.DISCONTINUOUS_POST,
            toIdModels(updatedIds),
          );
        }
      },
    );
  });

  describe('fetchData', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    const pageSize = 3;

    it.each`
      existPosts                 | anchor                        | needFetchPosts  | invalidPosts            | isMockedIds | expectedIds    | hasMore  | direction
      ${[5]}                     | ${undefined}                  | ${[6, 7]}       | ${[]}                   | ${[]}       | ${[5, 6, 7]}   | ${true}  | ${QUERY_DIRECTION.NEWER}
      ${[9]}                     | ${{ id: 7, sortValue: -7 }}   | ${[8, 10]}      | ${[]}                   | ${[]}       | ${[8, 9, 10]}  | ${true}  | ${QUERY_DIRECTION.NEWER}
      ${[]}                      | ${{ id: 10, sortValue: -10 }} | ${[11]}         | ${[]}                   | ${[]}       | ${[11]}        | ${false} | ${QUERY_DIRECTION.NEWER}
      ${[5, 10, 11]}             | ${{ id: 5, sortValue: -5 }}   | ${[6, 7, 8, 9]} | ${[6, 7, 8, 9, 11]}     | ${[]}       | ${[10]}        | ${false} | ${QUERY_DIRECTION.NEWER}
      ${[5, 10, 11]}             | ${undefined}                  | ${[6, 7, 8, 9]} | ${[6, 7, 8, 9, 11]}     | ${[]}       | ${[5, 10]}     | ${false} | ${QUERY_DIRECTION.NEWER}
      ${[5, 10, 11]}             | ${{ id: 5, sortValue: -5 }}   | ${[6, 7, 8, 9]} | ${[6, 7, 8, 9, 10, 11]} | ${[]}       | ${[]}          | ${false} | ${QUERY_DIRECTION.NEWER}
      ${[5, 10, 11]}             | ${{ id: 5, sortValue: -5 }}   | ${[6, 7, 8, 9]} | ${[6, 7, 8, 9]}         | ${[10, 11]} | ${[]}          | ${false} | ${QUERY_DIRECTION.NEWER}
      ${[9]}                     | ${{ id: 7, sortValue: -7 }}   | ${[8, 10, 11]}  | ${[]}                   | ${[9]}      | ${[8, 10, 11]} | ${false} | ${QUERY_DIRECTION.NEWER}
      ${[5, 6, 7, 8, 9, 10, 11]} | ${undefined}                  | ${[]}           | ${[]}                   | ${[]}       | ${[]}          | ${false} | ${QUERY_DIRECTION.OLDER}
      ${[5, 6, 7, 8, 9, 10, 11]} | ${{ id: 11, sortValue: -11 }} | ${[]}           | ${[]}                   | ${[]}       | ${[8, 9, 10]}  | ${true}  | ${QUERY_DIRECTION.OLDER}
      ${[5, 6, 7, 8, 9, 10, 11]} | ${{ id: 9, sortValue: -9 }}   | ${[]}           | ${[7]}                  | ${[]}       | ${[5, 6, 8]}   | ${false} | ${QUERY_DIRECTION.OLDER}
    `(
      'should return with expected data, $expectedIds, hasMore: $hasMore, direction: $direction',
      async ({
        existPosts,
        anchor,
        needFetchPosts,
        invalidPosts,
        expectedIds,
        hasMore,
        direction,
        isMockedIds,
      }) => {
        setUpData(existPosts, needFetchPosts, invalidPosts, isMockedIds);

        const {
          data,
          hasMore: hasMoreResult,
        } = await idsDataProvider.fetchData(direction, pageSize, anchor);

        expectedIds.forEach((id: number) => {
          hasValidEntity(entityName, id);
        });

        expect(hasMoreResult).toEqual(hasMore);
        expect(data).toEqual(toIdModels(expectedIds));
      },
    );
  });
});
