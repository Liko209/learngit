/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-18 14:18:01
 * Copyright © RingCentral. All rights reserved.
 */

import { StateFetchDataController } from '../StateFetchDataController';
import { EntitySourceController } from '../../../../../framework/controller/impl/EntitySourceController';
import { GroupState } from '../../../entity';
import { GroupService } from '../../../../group';
import { DeactivatedDao } from '../../../../../dao';
import { IEntityPersistentController } from '../../../../../framework/controller/interface/IEntityPersistentController';

jest.mock('../../../../../framework/controller/impl/EntitySourceController');

describe('StateFetchDataController', () => {
  let stateFetchDataController: StateFetchDataController;
  let mockEntitySourceController: EntitySourceController;
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitySourceController = new EntitySourceController<GroupState>(
      {} as IEntityPersistentController,
      {} as DeactivatedDao,
    );
    stateFetchDataController = new StateFetchDataController(
      mockEntitySourceController,
    );
  });

  describe('getAllGroupStatesFromLocal', () => {
    it('should call functions with correct params', async () => {
      const ids: number[] = [];
      mockEntitySourceController.getEntitiesLocally = jest.fn();
      await stateFetchDataController.getAllGroupStatesFromLocal(ids);
      expect(mockEntitySourceController.getEntitiesLocally).toBeCalledWith(
        ids,
        false,
      );
    });
  });

  describe('getGroupStatesFromLocalWithUnread', () => {
    it('should return correct groupStates', async () => {
      const ids: number[] = [];
      stateFetchDataController.getAllGroupStatesFromLocal = jest
        .fn()
        .mockReturnValue([
          {
            id: 1,
            unread_count: 10,
          },
          {
            id: 2,
            unread_mentions_count: 10,
          },
          {
            id: 3,
          },
          {
            id: 4,
            unread_count: 0,
            unread_mentions_count: 0,
          },
        ]);
      expect(
        await stateFetchDataController.getGroupStatesFromLocalWithUnread(ids),
      ).toEqual([
        {
          id: 1,
          unread_count: 10,
        },
        {
          id: 2,
          unread_mentions_count: 10,
        },
      ]);
    });
  });
  describe('getUmiByIds', async () => {
    it('should get correct unread counts', async () => {
      const ids: number[] = [];
      const mockFunc = jest.fn();
      const unreadCounts = new Map<number, number>();
      unreadCounts[1] = 10;
      unreadCounts[2] = 10;
      unreadCounts[3] = 0;
      unreadCounts[4] = 1;
      mockEntitySourceController.batchGet = jest.fn().mockReturnValue([
        {
          id: 1,
          unread_count: 10,
        },
        {
          id: 2,
          unread_mentions_count: 10,
        },
        {
          id: 3,
        },
        {
          id: 4,
          unread_count: 0,
          unread_mentions_count: 1,
        },
      ]);
      GroupService.getInstance = jest.fn().mockReturnValue({
        getById: jest.fn().mockImplementation((id: number) => {
          if (id === 1 || id === 3) {
            return {
              is_team: false,
            };
          }
          return {
            is_team: true,
          };
        }),
      });
      await stateFetchDataController.getUmiByIds(ids, mockFunc);
      expect(mockFunc).toBeCalledWith(unreadCounts, true);
    });
  });
});
