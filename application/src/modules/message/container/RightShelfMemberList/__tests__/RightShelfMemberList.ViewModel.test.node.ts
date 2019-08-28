/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-26 14:09:24
 * Copyright © RingCentral. All rights reserved.
 */
import * as utils from '@/store/utils';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { RightShelfMemberListViewModel } from '../RightShelfMemberList.ViewModel';
import { GroupService } from 'sdk/module/group/service';
import { ENTITY_NAME } from '@/store/constants';
import { CONVERSATION_TYPES } from '@/constants';
import { notificationCenter, SERVICE } from 'sdk/service';

function getRandomInt(min: number, max: number) {
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
          companyId: 101010,
          isTeam: true,
        };
      }

      if (type === ENTITY_NAME.PERSON) {
        return {
          userDisplayName: 'xxx',
          companyId: 101010,
        };
      }
    });
    groupService.getMemberAndGuestIds = jest.fn().mockResolvedValue({
      realMemberIds: [123, 234, 456],
      guestIds: [111, 999],
      optionalIds: [],
    });
    mockGroupServce();
  });

  it('should isTeam be the same as the entity', () => {
    const vm = new RightShelfMemberListViewModel({ groupId: 1 });
    expect(vm.isTeam).toBe(true);

    jest.spyOn(utils, 'getEntity').mockImplementation(type => {
      if (type === ENTITY_NAME.GROUP) {
        return {
          members: [123, 234, 456, 111, 999],
          companyId: 101010,
          isTeam: false,
        };
      }
    });
    expect(vm.isTeam).toBe(false);
  });

  it('should call group service api right after construction', async () => {
    const vm = new RightShelfMemberListViewModel({ groupId: 1 });
    expect(vm.allMemberLength).toBe(5);
    await vm._getMemberAndGuestIds();

    expect(groupService.getMemberAndGuestIds).toHaveBeenCalledWith(1, 40, 10);
    expect(vm.membersData.isLoading).toBe(false);
    expect(vm._fullMemberIds).toEqual([123, 234, 456]);
    expect(vm._fullGuestIds).toEqual([111, 999]);
  });

  it('shouldHide should be true when the group is not acquired or it is a me conversation', () => {
    jest.spyOn(utils, 'getEntity').mockImplementation(type => {
      if (type === ENTITY_NAME.GROUP) {
        return {
          members: [123, 234, 456, 111, 999],
          companyId: 101010,
          isMocked: true,
        };
      }
    });
    let vm = new RightShelfMemberListViewModel({ groupId: 1 });
    expect(vm.shouldHide).toBe(true);

    jest.spyOn(utils, 'getEntity').mockImplementation(type => {
      if (type === ENTITY_NAME.GROUP) {
        return {
          members: [123, 234, 456, 111, 999],
          companyId: 101010,
          type: CONVERSATION_TYPES.ME,
        };
      }
    });
    vm = new RightShelfMemberListViewModel({ groupId: 1 });
    expect(vm.shouldHide).toBe(true);
  });

  it('shouldShowLink should be true for non-1:1 conversations, and false for 1:1', () => {
    const group = {
      members: [123, 234, 456, 111, 999],
      companyId: 101010,
      type: CONVERSATION_TYPES.ME,
    };
    jest.spyOn(utils, 'getEntity').mockImplementation(type => {
      if (type === ENTITY_NAME.GROUP) {
        return group;
      }
    });
    let vm = new RightShelfMemberListViewModel({ groupId: 1 });
    expect(vm.shouldShowLink).toBe(false);

    group.type = CONVERSATION_TYPES.NORMAL_ONE_TO_ONE;
    vm = new RightShelfMemberListViewModel({ groupId: 1 });
    expect(vm.shouldShowLink).toBe(false);

    group.type = CONVERSATION_TYPES.NORMAL_GROUP;
    vm = new RightShelfMemberListViewModel({ groupId: 1 });
    expect(vm.shouldShowLink).toBe(true);

    group.type = CONVERSATION_TYPES.TEAM;
    vm = new RightShelfMemberListViewModel({ groupId: 1 });
    expect(vm.shouldShowLink).toBe(true);
  });

  describe('setWrapperWidth & countPerRow', () => {
    it('should be 9 when wrapper width is between 348 and 360', () => {
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(348, 360));
      expect(vm._countPerRow).toBe(9);
      vm.setWrapperWidth(348);
      expect(vm._countPerRow).toBe(9);
      vm.setWrapperWidth(360);
      expect(vm._countPerRow).toBe(9);
    });

    it('should be 8 when wrapper width is between 312 and 347', () => {
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(312, 347));
      expect(vm._countPerRow).toBe(8);
      vm.setWrapperWidth(312);
      expect(vm._countPerRow).toBe(8);
      vm.setWrapperWidth(347);
      expect(vm._countPerRow).toBe(8);
    });

    it('should be 7 when wrapper width is between 276 and 311', () => {
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(276, 311));
      expect(vm._countPerRow).toBe(7);
      vm.setWrapperWidth(276);
      expect(vm._countPerRow).toBe(7);
      vm.setWrapperWidth(311);
      expect(vm._countPerRow).toBe(7);
    });

    it('should be 6 when wrapper width is between 240 and 275', () => {
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(240, 275));
      expect(vm._countPerRow).toBe(6);
      vm.setWrapperWidth(240);
      expect(vm._countPerRow).toBe(6);
      vm.setWrapperWidth(275);
      expect(vm._countPerRow).toBe(6);
    });

    it('should be 5 when wrapper width is between 204 and 239', () => {
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(204, 239));
      expect(vm._countPerRow).toBe(5);
      vm.setWrapperWidth(204);
      expect(vm._countPerRow).toBe(5);
      vm.setWrapperWidth(239);
      expect(vm._countPerRow).toBe(5);
    });
  });

  describe('member count and guest count', () => {
    it('should show correct counts when there are no guests and 27 members and row count is 9', async () => {
      groupService.getMemberAndGuestIds = jest.fn().mockResolvedValue({
        realMemberIds: Array(27)
          .fill(1)
          .map((_, index) => index),
        guestIds: [],
        optionalIds: [],
      });
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(348, 360));
      await vm._getMemberAndGuestIds();
      expect(vm._countPerRow).toBe(9);
      expect(vm.membersData.shownMemberIds.length).toBe(27);
      expect(vm.membersData.shownGuestIds.length).toBe(0);
      expect(Object.keys(vm.membersData.personNameMap).length).toBe(27);
    });

    it('should show correct counts when there are no guests and more than 27 members and row count is 9', async () => {
      groupService.getMemberAndGuestIds = jest.fn().mockResolvedValue({
        realMemberIds: Array(37)
          .fill(1)
          .map((_, index) => index + 37),
        guestIds: [],
        optionalIds: [],
      });
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(348, 360));
      expect(vm._countPerRow).toBe(9);
      await vm._getMemberAndGuestIds();
      expect(vm.membersData.shownMemberIds.length).toBe(26);
      expect(vm.membersData.shownGuestIds.length).toBe(0);
      expect(Object.keys(vm.membersData.personNameMap).length).toBe(26);
    });

    it('should show correct counts when there are guests and 27 members and row count is 9', async () => {
      groupService.getMemberAndGuestIds = jest.fn().mockResolvedValue({
        realMemberIds: Array(27)
          .fill(1)
          .map((_, index) => index),
        guestIds: Array(22)
          .fill(1)
          .map((_, index) => index + 27),
        optionalIds: [],
      });
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(348, 360));
      expect(vm._countPerRow).toBe(9);
      await vm._getMemberAndGuestIds();
      expect(vm.membersData.shownMemberIds.length).toBe(27);
      expect(vm.membersData.shownGuestIds.length).toBe(8);
      expect(Object.keys(vm.membersData.personNameMap).length).toBe(27 + 8);
    });

    it('should show correct counts when there are guests and 29 members and row count is 9', async () => {
      groupService.getMemberAndGuestIds = jest.fn().mockResolvedValue({
        realMemberIds: Array(22)
          .fill(1)
          .map((_, index) => index),
        guestIds: Array(9)
          .fill(1)
          .map((_, index) => index + 22 + 7),
        optionalIds: Array(7)
          .fill(1)
          .map((_, index) => index + 22),
      });
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.setWrapperWidth(getRandomInt(348, 360));
      expect(vm._countPerRow).toBe(9);
      await vm._getMemberAndGuestIds();
      expect(vm.membersData.shownMemberIds.length).toBe(26);
      expect(vm.membersData.shownGuestIds.length).toBe(9);
      expect(Object.keys(vm.membersData.personNameMap).length).toBe(26 + 9);
    });
  });

  describe('loadingH', () => {
    it('should compute correct height for the loading page when no guest section and 1 row of members', () => {
      jest.spyOn(utils, 'getEntity').mockImplementation(type => {
        if (type === ENTITY_NAME.GROUP) {
          return {
            members: [123, 234],
            companyId: 101010,
            isTeam: true,
            guestUserCompanyIds: [],
          };
        }
      });
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      expect(vm.loadingH).toBe(40 * 1);
    });

    it('should compute correct height for the loading page when there are guests section and 1 row of members', () => {
      jest.spyOn(utils, 'getEntity').mockImplementation(type => {
        if (type === ENTITY_NAME.GROUP) {
          return {
            members: [123, 234],
            companyId: 101010,
            isTeam: true,
            guestUserCompanyIds: [11, 2],
          };
        }
      });
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      expect(vm.loadingH).toBe(40 * 1 + 85);
    });

    it('should compute correct height for the loading page when there are guests section and more than 1 row of members', () => {
      jest.spyOn(utils, 'getEntity').mockImplementation(type => {
        if (type === ENTITY_NAME.GROUP) {
          return {
            members: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            companyId: 101010,
            isTeam: true,
            guestUserCompanyIds: [11, 2],
          };
        }
      });
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      expect(vm.loadingH).toBe(40 * 2 + 85);
    });
  });

  describe('dispose', () => {
    it('should call notification.off when dispose', () => {
      jest.spyOn(notificationCenter, 'off');
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      vm.dispose();
      expect(notificationCenter.off).toHaveBeenCalled();
    });
  });

  describe('init', () => {
    it('should init reactions on init', () => {
      const vm = new RightShelfMemberListViewModel({ groupId: 1 });
      jest.spyOn(vm, 'reaction').mockImplementation((fn, cb) => {
        fn();
      });
      vm.init();
      expect(vm.reaction).toHaveBeenCalledTimes(3);
    });
  });

  describe('canAddMembers', () => {
    it('should show entry on team when SDK indicates the user can add members [JPT-2785]', () => {
      jest.spyOn(utils, 'getEntity').mockImplementation(type => {
        if (type === ENTITY_NAME.GROUP) {
          return {
            isTeam: true,
            isCurrentUserHasPermissionAddMember: true,
          };
        }
      });

      const vm = new RightShelfMemberListViewModel({ groupId: 1 });

      expect(vm.canAddMembers).toBeTruthy();
    });

    it('should hide entry on team when SDK indicates the user cannot add members [JPT-2785]', () => {
      jest.spyOn(utils, 'getEntity').mockImplementation(type => {
        if (type === ENTITY_NAME.GROUP) {
          return {
            isTeam: true,
            isCurrentUserHasPermissionAddMember: false,
          };
        }
      });

      const vm = new RightShelfMemberListViewModel({ groupId: 1 });

      expect(vm.canAddMembers).toBeFalsy();
    });

    it('should show entry (keep current logic) when not a team [JPT-2785]', () => {
      jest.spyOn(utils, 'getEntity').mockImplementation(type => {
        if (type === ENTITY_NAME.GROUP) {
          return {
            isTeam: false,
            isCurrentUserHasPermissionAddMember: true,
          };
        }
      });

      const vm = new RightShelfMemberListViewModel({ groupId: 1 });

      expect(vm.canAddMembers).toBeTruthy();
    });
  });
});
