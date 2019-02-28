/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 16:08:17
 * Copyright © RingCentral. All rights reserved.
 */

import { StateActionController } from '../StateActionController';
import { GroupService } from '../../../../group';
import { IRequestController } from '../../../../../framework/controller/interface/IRequestController';
import { IPartialModifyController } from '../../../../../framework/controller/interface/IPartialModifyController';
import { EntitySourceController } from '../../../../../framework/controller/impl/EntitySourceController';
import { DeactivatedDao } from '../../../../../dao';
import { StateFetchDataController } from '../StateFetchDataController';
import { GroupState } from '../../../entity';
import { IEntityPersistentController } from '../../../../../framework/controller/interface/IEntityPersistentController';
import { TotalUnreadController } from '../TotalUnreadController';

jest.mock('../../../../post/service/PostService');
jest.mock('../StateFetchDataController');
jest.mock('../../../../../framework/controller/impl/EntitySourceController');
class MockRequestController implements IRequestController {
  get = jest.fn();
  put = jest.fn();
  post = jest.fn();
}

class MockPartialModifyController implements IPartialModifyController {
  constructor(public groupState: GroupState) {}
  updatePartially = jest.fn(
    (
      entityId: number,
      preHandlePartialEntity: (
        partialEntity: Partial<GroupState>,
        originalEntity: GroupState,
      ) => Partial<GroupState>,
      doUpdateEntity: (updatedEntity: GroupState) => Promise<GroupState>,
    ) => {
      const partialEntity: Partial<GroupState> = {};
      return preHandlePartialEntity(partialEntity, this.groupState);
    },
  );
  getRollbackPartialEntity = jest.fn();
  getMergedEntity = jest.fn();
}

describe('StateActionController', () => {
  let stateActionController: StateActionController;
  let mockRequestController: MockRequestController;
  let mockPartialModifyController: IPartialModifyController;
  let mockEntitySourceController: EntitySourceController;
  let mockStateFetchDataController: StateFetchDataController;
  let mockTotalUnreadController: TotalUnreadController;
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestController = new MockRequestController();

    mockEntitySourceController = new EntitySourceController<GroupState>(
      {} as IEntityPersistentController,
      {} as DeactivatedDao,
    );

    mockStateFetchDataController = new StateFetchDataController(
      mockEntitySourceController,
    );
    mockTotalUnreadController = new TotalUnreadController(
      mockEntitySourceController,
    );
    stateActionController = new StateActionController(
      mockEntitySourceController,
      mockRequestController,
      mockStateFetchDataController,
      mockTotalUnreadController,
    );

    mockPartialModifyController = new MockPartialModifyController({ id: 1 });
    Object.assign(stateActionController, {
      _partialModifyController: mockPartialModifyController,
    });
  });

  describe('updateReadStatus()', () => {
    it('should mark as unread when (lastPostId && myStateId > 0)', async () => {
      const groupId: number = 55668833;
      const isUnread: boolean = true;
      GroupService.getInstance = jest.fn().mockReturnValue({
        getById: jest.fn().mockReturnValue({
          most_recent_post_id: 123,
        }),
      });

      const originalModel = {
        id: groupId,
        unread_count: 0,
        unread_mentions_count: 0,
        read_through: 123,
        last_read_through: 123,
        marked_as_unread: false,
        post_cursor: 1,
        group_post_cursor: 1,
        group_post_drp_cursor: 0,
      };

      mockEntitySourceController.get.mockImplementationOnce(() => {
        return originalModel;
      });
      mockStateFetchDataController.getMyStateId = jest
        .fn()
        .mockReturnValue(5683);

      mockPartialModifyController = new MockPartialModifyController(
        originalModel,
      );
      Object.assign(stateActionController, {
        _partialModifyController: mockPartialModifyController,
      });

      await stateActionController.updateReadStatus(groupId, isUnread);
      expect(GroupService.getInstance<GroupService>().getById).toBeCalledWith(
        groupId,
      );
      expect(mockStateFetchDataController.getMyStateId).toBeCalled();
      expect(mockPartialModifyController.updatePartially).toBeCalled();
      expect(
        mockPartialModifyController.updatePartially.mock.results[0].value,
      ).toEqual({
        unread_count: 1,
        marked_as_unread: true,
        post_cursor: 0,
      });
    });

    it('should mark as read when (lastPostId && myStateId > 0)', async () => {
      const groupId: number = 55668833;
      const isUnread: boolean = false;
      GroupService.getInstance = jest.fn().mockReturnValue({
        getById: jest.fn().mockReturnValue({
          most_recent_post_id: 123,
        }),
      });
      mockStateFetchDataController.getMyStateId = jest
        .fn()
        .mockReturnValue(5683);

      const originalModel = {
        id: groupId,
        unread_count: 1,
        unread_mentions_count: 0,
        read_through: 123,
        last_read_through: 123,
        marked_as_unread: true,
        post_cursor: 1,
        group_post_cursor: 2,
        group_post_drp_cursor: 0,
        unread_deactivated_count: 0,
      };
      mockEntitySourceController.get.mockImplementationOnce(() => {
        return originalModel;
      });

      mockPartialModifyController = new MockPartialModifyController(
        originalModel,
      );
      Object.assign(stateActionController, {
        _partialModifyController: mockPartialModifyController,
      });

      await stateActionController.updateReadStatus(groupId, isUnread);
      expect(GroupService.getInstance<GroupService>().getById).toBeCalledWith(
        groupId,
      );
      expect(mockStateFetchDataController.getMyStateId).toBeCalled();
      expect(mockPartialModifyController.updatePartially).toBeCalled();
      expect(
        mockPartialModifyController.updatePartially.mock.results[0].value,
      ).toEqual({
        unread_count: 0,
        unread_mentions_count: 0,
        read_through: 123,
        last_read_through: 123,
        marked_as_unread: false,
        unread_deactivated_count: 0,
      });
    });
  });

  describe('updateLastGroup()', () => {
    it('should send request when myStateId > 0', async () => {
      const groupId: number = 55668833;
      const myStateId: number = 5683;
      mockStateFetchDataController.getMyStateId = jest
        .fn()
        .mockReturnValue(myStateId);
      await stateActionController.updateLastGroup(groupId);
      expect(mockRequestController.put).toBeCalledWith({
        id: myStateId,
        last_group_id: groupId,
      });
    });

    it('should not send request when myStateId <= 0', async () => {
      const groupId: number = 55668833;
      const myStateId: number = 0;
      mockStateFetchDataController.getMyStateId = jest
        .fn()
        .mockReturnValue(myStateId);
      await stateActionController.updateLastGroup(groupId);
      expect(mockRequestController.put).toBeCalledTimes(0);
    });
  });

  describe('_buildUpdateReadStatusParams()', () => {
    it('should return correct Param object', () => {
      const stateId = 5683;
      const groupState = {
        id: 55668833,
        unread_count: 6,
        unread_mentions_count: 2,
        unread_deactivated_count: 1,
        read_through: 11223344,
        marked_as_unread: true,
      };
      expect(
        stateActionController['_buildUpdateReadStatusParams'](
          stateId,
          groupState,
        ),
      ).toEqual({
        id: 5683,
        'unread_count:55668833': 6,
        'unread_mentions_count:55668833': 2,
        'unread_deactivated_count:55668833': 1,
        'read_through:55668833': 11223344,
        'marked_as_unread:55668833': true,
      });
    });
  });
});
