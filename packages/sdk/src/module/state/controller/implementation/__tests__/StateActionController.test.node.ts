/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 16:08:17
 * Copyright © RingCentral. All rights reserved.
 */

import { StateActionController } from '../StateActionController';
import { GroupService } from '../../../../group';
import { IRequestController } from '../../../../../framework/controller/interface/IRequestController';
import {
  IPartialModifyController,
  PartialUpdateParams,
} from '../../../../../framework/controller/interface/IPartialModifyController';
import { EntitySourceController } from '../../../../../framework/controller/impl/EntitySourceController';
import { DeactivatedDao } from '../../../../../dao';
import { StateFetchDataController } from '../StateFetchDataController';
import { GroupState } from '../../../entity';
import { IEntityPersistentController } from '../../../../../framework/controller/interface/IEntityPersistentController';

jest.mock('../../../../post/service/PostService');
jest.mock('../StateFetchDataController');
jest.mock('../../../../../framework/controller/impl/EntitySourceController');
jest.mock('../../../../group');

class MockRequestController implements IRequestController<GroupState> {
  get = jest.fn();
  put = jest.fn();
  post = jest.fn();
}

class MockPartialModifyController
  implements IPartialModifyController<GroupState> {
  constructor(public groupState: GroupState) {}
  updatePartially = jest.fn(async (params: PartialUpdateParams<any>) => {
    const { preHandlePartialEntity, doUpdateEntity } = params;
    const partialEntity: Partial<GroupState> = {};
    const updatedEntity = await preHandlePartialEntity!(
      partialEntity,
      this.groupState,
    );
    return await doUpdateEntity!(updatedEntity as GroupState);
  });
  getRollbackPartialEntity = jest.fn();
  getMergedEntity = jest.fn();
}

describe('StateActionController', () => {
  let stateActionController: StateActionController;
  let mockRequestController: MockRequestController;
  let mockEntitySourceController: EntitySourceController<GroupState>;
  let mockStateFetchDataController: StateFetchDataController;
  const mockGroupService = new GroupService();
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestController = new MockRequestController();

    mockEntitySourceController = new EntitySourceController<GroupState>(
      {} as IEntityPersistentController<GroupState>,
      {} as DeactivatedDao,
    );

    mockStateFetchDataController = new StateFetchDataController(
      mockEntitySourceController,
    );
    stateActionController = new StateActionController(
      mockGroupService,
      mockEntitySourceController,
      mockRequestController,
      mockStateFetchDataController,
    );
  });

  describe('updateReadStatus()', () => {
    it('should mark as unread when (lastPostId && myStateId > 0)', async () => {
      const groupId: number = 55668833;
      const isUnread: boolean = true;
      mockGroupService.getById = jest.fn().mockReturnValue({
        most_recent_post_id: 123,
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
        group_team_mention_cursor: 123,
      };

      jest
        .spyOn(mockEntitySourceController, 'get')
        .mockImplementationOnce(() => {
          return originalModel as any;
        });
      mockStateFetchDataController.getMyStateId = jest
        .fn()
        .mockReturnValue(5683);

      const mockPartialModifyController = new MockPartialModifyController(
        originalModel,
      );
      Object.assign(stateActionController, {
        _partialModifyController: mockPartialModifyController,
      });
      stateActionController['_buildUpdateUnreadStatusParams'] = jest.fn();

      await stateActionController.updateReadStatus(groupId, isUnread, true);
      expect(mockGroupService.getById).toHaveBeenCalledWith(groupId);
      expect(mockStateFetchDataController.getMyStateId).toHaveBeenCalled();
      expect(mockPartialModifyController.updatePartially).toHaveBeenCalled();
      expect(
        stateActionController['_buildUpdateUnreadStatusParams'],
      ).toHaveBeenCalled();
    });

    it('should mark as read when (lastPostId && myStateId > 0)', async () => {
      const groupId: number = 55668833;
      const isUnread: boolean = false;
      mockGroupService.getById = jest.fn().mockReturnValue({
        most_recent_post_id: 123,
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
        group_team_mention_cursor: 123,
      };
      jest
        .spyOn(mockEntitySourceController, 'get')
        .mockImplementationOnce(() => {
          return originalModel as any;
        });

      const mockPartialModifyController = new MockPartialModifyController(
        originalModel,
      );
      Object.assign(stateActionController, {
        _partialModifyController: mockPartialModifyController,
      });

      // fix prettier lint error
      const jestMockImpl = jest.fn().mockImplementationOnce;
      stateActionController['_buildUpdateReadStatusParams'] = jestMockImpl(
        () => {
          throw 'err';
        },
      );

      try {
        await stateActionController.updateReadStatus(groupId, isUnread, false);
      } catch (err) {
        expect(err).toEqual('err');
      }
      expect(mockGroupService.getById).toHaveBeenCalledWith(groupId);
      expect(mockStateFetchDataController.getMyStateId).toHaveBeenCalled();
      expect(mockPartialModifyController.updatePartially).toHaveBeenCalled();

      expect(
        stateActionController['_buildUpdateReadStatusParams'],
      ).toHaveBeenCalled();
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
      expect(mockRequestController.put).toHaveBeenCalledWith({
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
      expect(mockRequestController.put).toHaveBeenCalledTimes(0);
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
