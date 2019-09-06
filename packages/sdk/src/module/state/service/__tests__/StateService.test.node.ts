/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-22 14:36:02
 * Copyright © RingCentral. All rights reserved.
 */

import { StateService } from '../StateService';
import { State } from '../../entity';
import { Group } from '../../../group/entity';
import { Profile } from '../../../profile/entity';
import { NotificationEntityPayload } from '../../../../service/notificationCenter';
import { SYNC_SOURCE } from '../../../sync';
import { GroupService } from '../../../group/service';
import { StateController } from '../../controller/StateController';
import { MyStateConfig } from '../../config';

jest.mock('sdk/dao');
jest.mock('../../../group/service');
jest.mock('../../controller/StateController');
jest.mock('../../config');

describe('StateService', () => {
  const mockGroupService = new GroupService({} as any);
  let stateService: StateService;
  const mockUpdateIgnoredStatus = jest.fn();
  const mockUpdateReadStatus = jest.fn();
  const mockUpdateLastGroup = jest.fn();
  const mockGetAllGroupStatesFromLocal = jest.fn();
  const mockGetGroupStatesFromLocalWithUnread = jest.fn();
  const mockGetMyState = jest.fn();
  const mockGetMyStateId = jest.fn();
  const mockHandleState = jest.fn();
  const mockHandleGroupCursor = jest.fn();
  const mockHandleStateAndGroupCursor = jest.fn();
  const mockHandleGroupState = jest.fn();
  const mockHandleGroup = jest.fn();
  const mockHandleProfile = jest.fn();
  const mockGetSingleGroupBadge = jest.fn();
  const mockInitializeTotalUnread = jest.fn();
  const mockStateActionController = {
    updateReadStatus: mockUpdateReadStatus,
    updateLastGroup: mockUpdateLastGroup,
  };
  const mockStateDataHandleController = {
    updateIgnoredStatus: mockUpdateIgnoredStatus,
    handleState: mockHandleState,
    handleGroupCursor: mockHandleGroupCursor,
    handleStateAndGroupCursor: mockHandleStateAndGroupCursor,
  };
  const mockStateFetchDataController = {
    getAllGroupStatesFromLocal: mockGetAllGroupStatesFromLocal,
    getGroupStatesFromLocalWithUnread: mockGetGroupStatesFromLocalWithUnread,
    getMyState: mockGetMyState,
    getMyStateId: mockGetMyStateId,
  };
  const mockTotalUnreadController = {
    handleGroupState: mockHandleGroupState,
    handleGroup: mockHandleGroup,
    handleProfile: mockHandleProfile,
    getSingleGroupBadge: mockGetSingleGroupBadge,
    initializeTotalUnread: mockInitializeTotalUnread,
  };
  const mockStateController = {
    stateActionController: mockStateActionController,
    stateDataHandleController: mockStateDataHandleController,
    stateFetchDataController: mockStateFetchDataController,
    totalUnreadController: mockTotalUnreadController,
  };

  beforeEach(() => {
    stateService = new StateService(mockGroupService);
    stateService['_stateController'] = mockStateController as any;
  });

  describe('getStateController()', () => {
    it('should create state controller', () => {
      stateService['_stateController'] = undefined as any;
      stateService['stateController'];
      expect(StateController).toHaveBeenCalled();
    });
  });

  describe('myStateConfig', () => {
    it('should create my state config', () => {
      stateService.myStateConfig;
      expect(MyStateConfig).toHaveBeenCalled();
    });
  });

  describe('updateIgnoredStatus()', () => {
    it('should call with correct params', async () => {
      const ids: number[] = [5683];
      const isIgnored: boolean = true;
      await stateService.updateIgnoredStatus(ids, isIgnored);
      expect(mockUpdateIgnoredStatus).toHaveBeenCalledWith(ids, isIgnored);
    });
  });

  describe('updateReadStatus()', () => {
    it('should call with correct params', async () => {
      const id: number = 5683;
      const isUnread: boolean = true;
      await stateService.updateReadStatus(id, isUnread, true);
      expect(mockUpdateReadStatus).toHaveBeenCalledWith(id, isUnread, true);
    });
  });

  describe('updateLastGroup()', () => {
    it('should call with correct params', async () => {
      const id: number = 5683;
      await stateService.updateLastGroup(id);
      expect(mockUpdateLastGroup).toHaveBeenCalledWith(id);
    });
  });

  describe('getAllGroupStatesFromLocal()', () => {
    it('should call with correct params', async () => {
      const ids: number[] = [5683];
      await stateService.getAllGroupStatesFromLocal(ids);
      expect(mockGetAllGroupStatesFromLocal).toHaveBeenCalledWith(ids);
    });
  });

  describe('getGroupStatesFromLocalWithUnread()', () => {
    it('should call with correct params', async () => {
      const ids: number[] = [5683];
      await stateService.getGroupStatesFromLocalWithUnread(ids);
      expect(mockGetGroupStatesFromLocalWithUnread).toHaveBeenCalledWith(ids);
    });
  });

  describe('getMyState()', () => {
    it('should call with correct params', async () => {
      await stateService.getMyState();
      expect(mockGetMyState).toHaveBeenCalledWith();
    });
  });

  describe('getMyStateId()', () => {
    it('should call with correct params', async () => {
      await stateService.getMyStateId();
      expect(mockGetMyStateId).toHaveBeenCalledWith();
    });
  });

  describe('handleState()', () => {
    it('should call with correct params', async () => {
      const states: Partial<State>[] = [];
      await stateService.handleState(states, SYNC_SOURCE.INDEX);
      expect(mockHandleState).toHaveBeenCalledWith(
        states,
        SYNC_SOURCE.INDEX,
        undefined,
      );
    });
  });

  describe('handleGroupCursor()', () => {
    it('should call with correct params', async () => {
      const groups: Partial<Group>[] = [];
      await stateService.handleGroupCursor(groups, SYNC_SOURCE.INDEX);
      expect(mockHandleGroupCursor).toHaveBeenCalledWith(
        groups,
        SYNC_SOURCE.INDEX,
        undefined,
      );
    });
  });

  describe('handleStateAndGroupCursor()', () => {
    it('should call with correct params', async () => {
      const states: Partial<State>[] = [];
      const groups: Partial<Group>[] = [];
      await stateService.handleStateAndGroupCursor(
        states,
        groups,
        SYNC_SOURCE.INDEX,
      );
      expect(mockHandleStateAndGroupCursor).toHaveBeenCalledWith(
        states,
        groups,
        SYNC_SOURCE.INDEX,
        undefined,
      );
    });
  });

  describe('handleStateChangeForTotalUnread()', () => {
    it('should call with correct params', async () => {
      const payload = {} as NotificationEntityPayload<Group>;
      await stateService.handleStateChangeForTotalUnread(payload);
      expect(mockHandleGroupState).toHaveBeenCalledWith(payload);
    });
  });

  describe('handleGroupChangeForTotalUnread()', () => {
    it('should call with correct params', async () => {
      const payload: Group[] = [];
      await stateService.handleGroupChangeForTotalUnread(payload);
      expect(mockHandleGroup).toHaveBeenCalledWith(payload);
    });
  });

  describe('handleProfileChangeForTotalUnread()', () => {
    it('should call with correct params', async () => {
      const payload = {} as NotificationEntityPayload<Profile>;
      await stateService.handleProfileChangeForTotalUnread(payload);
      expect(mockHandleProfile).toHaveBeenCalledWith(payload);
    });
  });

  describe('getSingleGroupBadge()', () => {
    it('should call with correct params', async () => {
      const id: number = 55668833;
      await stateService.getSingleGroupBadge(id);
      expect(mockGetSingleGroupBadge).toHaveBeenCalledWith(id);
    });
  });

  describe('getById', () => {
    it('shoule receive null when id is not correct group id', async () => {
      try {
        await stateService.getById(1);
      } catch (e) {
        expect(e).toBeNull();
      }
    });
  });

  describe('_initBadge()', () => {
    it('should call controller', async () => {
      await stateService['_initBadge']();
      expect(mockGetSingleGroupBadge).toHaveBeenCalled();
    });
  });
});
