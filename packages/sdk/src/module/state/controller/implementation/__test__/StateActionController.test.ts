/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 16:08:17
 * Copyright © RingCentral. All rights reserved.
 */

import { StateActionController } from '../StateActionController';
import { IRequestController } from '../../../../../framework/controller/interface/IRequestController';
import { IPartialModifyController } from '../../../../../framework/controller/interface/IPartialModifyController';
import { EntitySourceController } from '../../../../../framework/controller/impl/EntitySourceController';
import { DeactivatedDao } from '../../../../../dao';
import PostService from '../../../../../service/post';
import { StateFetchDataController } from '../StateFetchDataController';
import { GroupState } from '../../../entity';
import { IEntityPersistentController } from '../../../../../framework/controller/interface/IEntityPersistentController';

class MockRequestController implements IRequestController {
  get = jest.fn();
  put = jest.fn();
  post = jest.fn();
}

class MockPartialModifyController implements IPartialModifyController {
  updatePartially = jest.fn(
    (
      entityId: number,
      preHandlePartialEntity: (
        partialEntity: Partial<GroupState>,
        originalEntity: GroupState,
      ) => Partial<GroupState>,
      doUpdateEntity: (updatedEntity: GroupState) => Promise<GroupState>,
    ) => {
      const originalEntity: GroupState = {
        id: 0,
        group_post_cursor: 0,
        group_post_drp_cursor: 0,
      };
      const partialEntity: Partial<GroupState> = {};
      return preHandlePartialEntity(partialEntity, originalEntity);
    },
  );
  getRollbackPartialEntity = jest.fn();
  getMergedEntity = jest.fn();
}

jest.mock('../../../../../service/post');
jest.mock('../StateFetchDataController');
jest.mock('../../../../../framework/controller/impl/EntitySourceController');

describe('StateActionController', () => {
  let stateActionController: StateActionController;
  let mockRequestController: MockRequestController;
  let mockPartialModifyController: MockPartialModifyController;
  let mockEntitySourceController: EntitySourceController;
  let mockStateFetchDataController: StateFetchDataController;
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestController = new MockRequestController();
    mockPartialModifyController = new MockPartialModifyController();
    mockEntitySourceController = new EntitySourceController<GroupState>(
      {} as IEntityPersistentController,
      {} as DeactivatedDao,
    );
    mockStateFetchDataController = new StateFetchDataController(
      mockEntitySourceController,
    );
    stateActionController = new StateActionController(
      mockPartialModifyController,
      mockRequestController,
      mockEntitySourceController,
      mockStateFetchDataController,
    );
  });

  describe('updateReadStatus()', () => {
    it('should *****', async () => {
      const groupId: number = 55668833;
      const readStatus: boolean = true;
      mockEntitySourceController.get = jest.fn().mockReturnValue({
        id: 55668833,
        marked_as_unread: false,
      });
      stateActionController['_getLastPostOfGroup'] = jest.fn().mockReturnValue({
        // id: 5683,
      });
      PostService.getInstance = jest.fn().mockReturnValue({
        getNewestPostIdOfGroup: jest.fn().mockReturnValue(5683),
      });
      mockStateFetchDataController.getMyStateId = jest
        .fn()
        .mockReturnValue(5683);
      stateActionController['_updateStateCursor'] = jest
        .fn()
        .mockReturnValue(0);
      await stateActionController.updateReadStatus(groupId, readStatus);
      expect(mockEntitySourceController.get).toBeCalled();
      expect(stateActionController['_getLastPostOfGroup']).toBeCalled();
      expect(
        PostService.getInstance<PostService>().getNewestPostIdOfGroup,
      ).toBeCalled();
      expect(mockStateFetchDataController.getMyStateId).toBeCalled();
      expect(mockPartialModifyController.updatePartially).toBeCalled();
      expect(stateActionController['_updateStateCursor']).toBeCalled();
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

  describe('_updateStateCursor()', () => {});
  describe('_buildUpdateReadStatusParams()', () => {});
});
