/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-22 14:36:02
 * Copyright © RingCentral. All rights reserved.
 */

import { StateService } from '../StateService';
import { State } from '../../entity';
import { Group } from '../../../group/entity';

describe('StateService', () => {
  const stateService = new StateService();
  const mockUpdateReadStatus = jest.fn();
  const mockUpdateLastGroup = jest.fn();
  const mockGetAllGroupStatesFromLocal = jest.fn();
  const mockGetGroupStatesFromLocalWithUnread = jest.fn();
  const mockGetMyState = jest.fn();
  const mockGetMyStateId = jest.fn();
  const mockHandleState = jest.fn();
  const mockHandleGroupCursor = jest.fn();
  const mockGetUmiByIds = jest.fn();

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
      getUmiByIds: mockGetUmiByIds,
    });
    stateService['getStateController'] = jest.fn().mockReturnValue({
      getStateActionController: mockStateActionController,
      getStateDataHandleController: mockStateDataHandleController,
      getStateFetchDataController: mockStateFetchDataController,
    });
  });

  describe('updateReadStatus()', () => {
    it('should call with correct params', async () => {
      const id: number = 5683;
      const isUnread: boolean = true;
      await stateService.updateReadStatus(id, isUnread);
      expect(mockUpdateReadStatus).toBeCalledWith(id, isUnread);
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
      await stateService.handleState(states);
      expect(mockHandleState).toBeCalledWith(states);
    });
  });

  describe('handleGroupCursor()', () => {
    it('should call with correct params', async () => {
      const groups: Partial<Group>[] = [];
      await stateService.handleGroupCursor(groups);
      expect(mockHandleGroupCursor).toBeCalledWith(groups);
    });
  });

  describe('getUmiByIds()', () => {
    it('should call with correct params', async () => {
      const ids: number[] = [5683];
      const updateUmi = (
        unreadCounts: Map<number, number>,
        important: boolean,
      ) => {};
      await stateService.getUmiByIds(ids, updateUmi);
      expect(mockGetUmiByIds).toBeCalledWith(ids, updateUmi);
    });
  });
});
