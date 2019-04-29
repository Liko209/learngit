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
import { SYNC_SOURCE } from '../../../../module/sync';
import { GroupService } from '../../../group/service';

jest.mock('../../../group/service');

describe('StateService', () => {
  const mockGroupService = new GroupService();
  const stateService = new StateService(mockGroupService);
  const mockUpdateReadStatus = jest.fn();
  const mockUpdateLastGroup = jest.fn();
  const mockGetAllGroupStatesFromLocal = jest.fn();
  const mockGetGroupStatesFromLocalWithUnread = jest.fn();
  const mockGetMyState = jest.fn();
  const mockGetMyStateId = jest.fn();
  const mockHandleState = jest.fn();
  const mockHandleGroupCursor = jest.fn();
  const mockHandleGroup = jest.fn();
  const mockHandleGroupState = jest.fn();
  const mockHandleProfile = jest.fn();
  const mockGetSingleUnreadInfo = jest.fn();

  beforeAll(() => {
    const mockStateActionController = jest.fn().mockReturnValue({
      updateReadStatus: mockUpdateReadStatus,
      updateLastGroup: mockUpdateLastGroup,
    });
    const mockStateDataHandleController = jest.fn().mockReturnValue({
      handleState: mockHandleState,
      handleGroupCursor: mockHandleGroupCursor,
    });
    const mockStateFetchDataController = jest.fn().mockReturnValue({
      getAllGroupStatesFromLocal: mockGetAllGroupStatesFromLocal,
      getGroupStatesFromLocalWithUnread: mockGetGroupStatesFromLocalWithUnread,
      getMyState: mockGetMyState,
      getMyStateId: mockGetMyStateId,
    });
    const mockTotalUnreadController = jest.fn().mockReturnValue({
      handleGroup: mockHandleGroup,
      handleGroupState: mockHandleGroupState,
      handleProfile: mockHandleProfile,
      getSingleUnreadInfo: mockGetSingleUnreadInfo,
    });
    stateService['getStateController'] = jest.fn().mockReturnValue({
      getStateActionController: mockStateActionController,
      getStateDataHandleController: mockStateDataHandleController,
      getStateFetchDataController: mockStateFetchDataController,
      getTotalUnreadController: mockTotalUnreadController,
    });
  });

  describe('updateReadStatus()', () => {
    it('should call with correct params', async () => {
      const id: number = 5683;
      const isUnread: boolean = true;
      await stateService.updateReadStatus(id, isUnread, true);
      expect(mockUpdateReadStatus).toBeCalledWith(id, isUnread, true);
    });
  });

  describe('updateLastGroup()', () => {
    it('should call with correct params', async () => {
      const id: number = 5683;
      await stateService.updateLastGroup(id);
      expect(mockUpdateLastGroup).toBeCalledWith(id);
    });
  });

  describe('getAllGroupStatesFromLocal()', () => {
    it('should call with correct params', async () => {
      const ids: number[] = [5683];
      await stateService.getAllGroupStatesFromLocal(ids);
      expect(mockGetAllGroupStatesFromLocal).toBeCalledWith(ids);
    });
  });

  describe('getGroupStatesFromLocalWithUnread()', () => {
    it('should call with correct params', async () => {
      const ids: number[] = [5683];
      await stateService.getGroupStatesFromLocalWithUnread(ids);
      expect(mockGetGroupStatesFromLocalWithUnread).toBeCalledWith(ids);
    });
  });

  describe('getMyState()', () => {
    it('should call with correct params', async () => {
      await stateService.getMyState();
      expect(mockGetMyState).toBeCalledWith();
    });
  });

  describe('getMyStateId()', () => {
    it('should call with correct params', async () => {
      await stateService.getMyStateId();
      expect(mockGetMyStateId).toBeCalledWith();
    });
  });

  describe('handleState()', () => {
    it('should call with correct params', async () => {
      const states: Partial<State>[] = [];
      await stateService.handleState(states, SYNC_SOURCE.INDEX);
      expect(mockHandleState).toBeCalledWith(
        states,
        SYNC_SOURCE.INDEX,
        undefined,
      );
    });
  });

  describe('handleGroupCursor()', () => {
    it('should call with correct params', async () => {
      const groups: Partial<Group>[] = [];
      await stateService.handleGroupCursor(groups);
      expect(mockHandleGroupCursor).toBeCalledWith(groups);
    });
  });

  describe('handleStateChangeForTotalUnread()', () => {
    it('should call with correct params', async () => {
      const payload = {} as NotificationEntityPayload<Group>;
      await stateService.handleStateChangeForTotalUnread(payload);
      expect(mockHandleGroupState).toBeCalledWith(payload);
    });
  });

  describe('handleGroupChangeForTotalUnread()', () => {
    it('should call with correct params', async () => {
      const payload = {} as NotificationEntityPayload<Group>;
      await stateService.handleGroupChangeForTotalUnread(payload);
      expect(mockHandleGroup).toBeCalledWith(payload);
    });
  });

  describe('handleProfileChangeForTotalUnread()', () => {
    it('should call with correct params', async () => {
      const payload = {} as NotificationEntityPayload<Profile>;
      await stateService.handleProfileChangeForTotalUnread(payload);
      expect(mockHandleProfile).toBeCalledWith(payload);
    });
  });

  describe('getSingleUnreadInfo()', () => {
    it('should call with correct params', async () => {
      const id: number = 55668833;
      await stateService.getSingleUnreadInfo(id);
      expect(mockGetSingleUnreadInfo).toBeCalledWith(id);
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
});
