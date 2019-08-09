/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-26 14:09:24
 * Copyright © RingCentral. All rights reserved.
 */
import * as utils from '@/store/utils';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { RightShelfMemberListViewModel } from '../RightShelfMemberList.ViewModel';
import { GroupService } from 'sdk/module/group/service';
import { ENTITY_NAME, GLOBAL_KEYS } from '@/store/constants';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const groupService: GroupService = {};

const mockGroupServce = () => {
  ServiceLoader.getInstance = jest.fn().mockReturnValue(groupService);
};
describe('RightShelfMemberListViewModel', () => {
  beforeEach(() => {
    jest.spyOn(utils, 'getEntity').mockImplementation(type => {
      if (type === ENTITY_NAME.GROUP) {
        return {
          members: [123, 234, 456, 111, 999],
        };
      }

      if (type === ENTITY_NAME.PERSON) {
        return {
          userDisplayName: 'xxx',
          companyId: 101010,
        };
      }
    });
    jest.spyOn(utils, 'getGlobalValue').mockImplementation(key => {
      if (key === GLOBAL_KEYS.CURRENT_COMPANY_ID) {
        return 101010;
      }
    });
    groupService.getMemberAndGuestIds = jest.fn().mockResolvedValue({
      realMemberIds: [123, 234, 456],
      guestIds: [111, 999],
      optionalIds: [],
    });
    mockGroupServce();
  });

  it('should call group service api right after construction', async () => {
    const vm = new RightShelfMemberListViewModel({ groupId: 1 });
    expect(vm.isLoading).toBe(true);
    expect(vm.allMemberLength).toBe(5);
    await vm._getMemberAndGuestIds();

    expect(groupService.getMemberAndGuestIds).toHaveBeenCalledWith(1, 40, 10);
    expect(vm.isLoading).toBe(false);
    expect(vm.fullMemberIds).toEqual([123, 234, 456]);
    expect(vm.fullGuestIds).toEqual([111, 999]);
  });

  describe('setWrapperWidth & countPerRow', () => {
    it('should be 9 when wrapper width is between 348 and 360', () => {
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(348, 360));
      expect(vm.countPerRow).toBe(9);
      vm.setWrapperWidth(348);
      expect(vm.countPerRow).toBe(9);
      vm.setWrapperWidth(360);
      expect(vm.countPerRow).toBe(9);
    });

    it('should be 8 when wrapper width is between 312 and 347', () => {
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(312, 347));
      expect(vm.countPerRow).toBe(8);
      vm.setWrapperWidth(312);
      expect(vm.countPerRow).toBe(8);
      vm.setWrapperWidth(347);
      expect(vm.countPerRow).toBe(8);
    });

    it('should be 7 when wrapper width is between 276 and 311', () => {
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(276, 311));
      expect(vm.countPerRow).toBe(7);
      vm.setWrapperWidth(276);
      expect(vm.countPerRow).toBe(7);
      vm.setWrapperWidth(311);
      expect(vm.countPerRow).toBe(7);
    });

    it('should be 6 when wrapper width is between 240 and 275', () => {
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(240, 275));
      expect(vm.countPerRow).toBe(6);
      vm.setWrapperWidth(240);
      expect(vm.countPerRow).toBe(6);
      vm.setWrapperWidth(275);
      expect(vm.countPerRow).toBe(6);
    });

    it('should be 5 when wrapper width is between 204 and 239', () => {
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(204, 239));
      expect(vm.countPerRow).toBe(5);
      vm.setWrapperWidth(204);
      expect(vm.countPerRow).toBe(5);
      vm.setWrapperWidth(239);
      expect(vm.countPerRow).toBe(5);
    });
  });

  describe('member count and guest count', () => {
    it('should show correct counts when there are no guests and 36 members and row count is 9', async () => {
      groupService.getMemberAndGuestIds = jest.fn().mockResolvedValue({
        realMemberIds: Array(36).fill(1),
        guestIds: [],
        optionalIds: [],
      });
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(348, 360));
      await vm._getMemberAndGuestIds();
      expect(vm.countPerRow).toBe(9);
      expect(vm.shownMemberIds.length).toBe(36);
      expect(vm.shownGuestIds.length).toBe(0);
    });

    it('should show correct counts when there are no guests and more than 36 members and row count is 9', async () => {
      groupService.getMemberAndGuestIds = jest.fn().mockResolvedValue({
        realMemberIds: Array(37).fill(1),
        guestIds: [],
        optionalIds: [],
      });
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(348, 360));
      expect(vm.countPerRow).toBe(9);
      await vm._getMemberAndGuestIds();
      expect(vm.shownMemberIds.length).toBe(35);
      expect(vm.shownGuestIds.length).toBe(0);
    });

    it('should show correct counts when there are guests and 27 members and row count is 9', async () => {
      groupService.getMemberAndGuestIds = jest.fn().mockResolvedValue({
        realMemberIds: Array(27).fill(1),
        guestIds: Array(22).fill(1),
        optionalIds: [],
      });
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(348, 360));
      expect(vm.countPerRow).toBe(9);
      await vm._getMemberAndGuestIds();
      expect(vm.shownMemberIds.length).toBe(27);
      expect(vm.shownGuestIds.length).toBe(8);
    });

    it('should show correct counts when there are guests and 29 members and row count is 9', async () => {
      groupService.getMemberAndGuestIds = jest.fn().mockResolvedValue({
        realMemberIds: Array(22).fill(1),
        guestIds: Array(9).fill(1),
        optionalIds: Array(7).fill(1),
      });
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(348, 360));
      expect(vm.countPerRow).toBe(9);
      await vm._getMemberAndGuestIds();
      expect(vm.shownMemberIds.length).toBe(26);
      expect(vm.shownGuestIds.length).toBe(9);
    });
  });
});
