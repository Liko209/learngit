/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-29 10:47:27
 * Copyright © RingCentral. All rights reserved.
 */
import {
  getGlobalValue,
  getEntity,
  getSingleEntity,
} from '../../utils/entities';
import SectionGroupHandler from '../SectionGroupHandler';
import { SECTION_TYPE } from '@/modules/message/container/LeftRail/Section/types';
import { Notification } from '@/containers/Notification';
import { ProfileService } from 'sdk/module/profile';
import { StateService } from 'sdk/module/state';
import { GroupService } from 'sdk/module/group';
import { notificationCenter, ENTITY, GROUP_QUERY_TYPE } from 'sdk/service';
import { QUERY_DIRECTION } from 'sdk/dao';
import { PreFetchConversationDataHandler } from '../PreFetchConversationDataHandler';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ENTITY_NAME } from '@/store/constants';

jest.mock('@/containers/Notification');
// jest.mock('../PreFetchConversationDataHandler');
jest.mock('sdk/api');
jest.mock('sdk/module/profile');
jest.mock('sdk/module/state');
jest.mock('sdk/module/group');
jest.mock('../../utils/entities');
jest.mock('sdk/module/account/config');

let profileService: ProfileService;
let stateService: StateService;
let groupService: GroupService;

function setup() {
  profileService = new ProfileService();
  stateService = new StateService();
  groupService = new GroupService();
  ServiceLoader.getInstance = jest
    .fn()
    .mockImplementation((serviceName: string) => {
      if (ServiceConfig.PROFILE_SERVICE === serviceName) {
        return profileService;
      }

      if (ServiceConfig.STATE_SERVICE === serviceName) {
        return stateService;
      }

      if (ServiceConfig.GROUP_SERVICE === serviceName) {
        return groupService;
      }

      if (ServiceConfig.ACCOUNT_SERVICE === serviceName) {
        return {
          userConfig: {
            getCurrentUserProfileId: jest.fn(),
            getGlipUserId: jest.fn(),
          },
        };
      }

      return null;
    });
  (profileService.getProfile as jest.Mock).mockResolvedValue({});
  (getGlobalValue as jest.Mock).mockReturnValue(1);
  getEntity.mockReturnValue({ unreadCount: 1 });
  jest.spyOn(stateService, 'batchGet').mockResolvedValue([]);
}

function clearMocks() {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  jest.resetAllMocks();
}

const expectIds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 18, 19];

describe('SectionGroupHandler', () => {
  describe('Group change notification', () => {
    const fakeData = [];
    function initData() {
      for (let i = 0; i < 30; i++) {
        fakeData.push({
          id: i,
          is_team: i > 14,
          created_at: i,
          most_recent_post_created_at: i,
          members: [1],
        });
      }
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return { data: [], hasMore: false };
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return { data: fakeData.slice(2, 11), hasMore: false };
          }
          return {
            data: [...fakeData[16], ...fakeData.slice(18, 20)],
            hasMore: true,
          };
        });
    }

    let sectionGroupHandler: SectionGroupHandler;
    beforeEach((done: jest.DoneCallback) => {
      clearMocks();
      setup();
      initData();
      sectionGroupHandler = SectionGroupHandler.getInstance();
      sectionGroupHandler.onReady(() => done());
      groupService.isValid = jest.fn().mockImplementation((group: any) => {
        return (
          group && !group.is_archived && !group.deactivated && !!group.members
        );
      });
    });

    afterEach(() => {
      SectionGroupHandler.getInstance().dispose();
      Object.assign(SectionGroupHandler, { _instance: undefined });
    });

    it('should add the sort groups to foc after SectionGroupHandler init', done => {
      setTimeout(() => {
        expect(
          sectionGroupHandler.groupIds.sort((a: number, b: number) => {
            if (a > b) {
              return 1;
            }
            if (a < b) {
              return -1;
            }
            return 0;
          }),
        ).toEqual(expectIds);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        done();
      });
    });

    it('should save groups to foc for groups change', done => {
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [
        fakeData[12],
        fakeData[11],
        fakeData[25],
        fakeData[26],
      ]);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([26, 25, 19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        done();
      });
    });

    it('should save unread groups to foc if not in range but has more is false', done => {
      sectionGroupHandler['_maxLeftRailGroup'] = 3;
      getEntity.mockReturnValue({ unreadCount: 1 });
      sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM].setHasMore(
        false,
        QUERY_DIRECTION.NEWER,
      );
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [
        fakeData[1],
        fakeData[15],
      ]);

      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16, 15]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        done();
      });
    });

    it('should save unread groups to foc if in range', done => {
      sectionGroupHandler['_maxLeftRailGroup'] = 3;
      getEntity.mockReturnValue({ unreadCount: 1 });
      sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM].setHasMore(
        false,
        QUERY_DIRECTION.NEWER,
      );
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [
        fakeData[1],
        fakeData[17],
      ]);

      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 17, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        done();
      });
    });

    it('should save groups without unread to foc if it is in limitation', done => {
      sectionGroupHandler['_maxLeftRailGroup'] = 3;
      getEntity.mockImplementation((entityName: ENTITY_NAME, id: any) => {
        if (id === 12 || id === 16 || id === 25) {
          return { unreadCount: 0 };
        }
        return { unreadCount: 1 };
      });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [
        fakeData[12],
        fakeData[25],
      ]);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([25, 19, 18]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([12, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        done();
      });
    });

    it('should not save groups without unread to foc if it is not in limitation', done => {
      sectionGroupHandler['_maxLeftRailGroup'] = 3;
      getEntity.mockImplementation((entityName: ENTITY_NAME, id: any) => {
        if (id === 15 || id === 16 || id === 7 || id === 1) {
          return { unreadCount: 0 };
        }
        return { unreadCount: 1 };
      });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [
        fakeData[1],
        fakeData[15],
        fakeData[16],
      ]);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 6, 5, 4, 3, 2, 1]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        done();
      });
    });

    it('should delete foc data if group is delete', done => {
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [3, 18]);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 2]);
        done();
      });
    });

    it('should not add this group in because it has not post and did not created by current user', done => {
      SectionGroupHandler.getInstance();
      getEntity.mockReturnValue({ unreadCount: 0 });
      const fakeData = [
        {
          id: 0,
          is_team: false,
          created_at: 0,
          creator_id: 2,
          members: [3],
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        done();
      });
    });

    it('should add this group in even it has not post but created by current user', done => {
      (getGlobalValue as jest.Mock).mockReturnValue(3);
      SectionGroupHandler.getInstance();
      const fakeData = {
        id: 11111,
        is_team: false,
        created_at: 0,
        creator_id: 3,
        members: [3],
      };

      const fakeData1 = {
        id: 11112,
        is_team: true,
        created_at: 100,
        creator_id: 3,
        members: [3, 2],
      };

      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [fakeData, fakeData1]);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([11112, 19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 11111]);
        done();
      });
    });

    it('should not add to foc which group is archived', done => {
      SectionGroupHandler.getInstance();
      const putData = [
        {
          id: 28,
          is_team: true,
          created_at: 28,
          members: [1],
        },
        {
          id: 35,
          is_team: true,
          created_at: 35,
          is_archived: true,
          members: [],
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, putData);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([28, 19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        done();
      });
    });

    it('should not save deactivated to foc', done => {
      SectionGroupHandler.getInstance();
      const fakeData = [
        {
          id: 1,
          is_team: false,
          created_at: 0,
          most_recent_post_created_at: 1,
          deactivated: true,
          members: [1],
        },
        {
          id: 0,
          is_team: false,
          created_at: 0,
          most_recent_post_created_at: 0,
          members: [1],
        },
        {
          id: 28,
          is_team: true,
          created_at: 28,
          deactivated: true,
          most_recent_post_created_at: 1,
          members: [1],
        },
        {
          id: 35,
          is_team: true,
          created_at: 35,
          most_recent_post_created_at: 1,
          members: [1],
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([35, 19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 0]);
        done();
      });
    });

    it('should not save the group which has not member list to foc when update data', done => {
      SectionGroupHandler.getInstance();
      const fakeData = [
        {
          id: 1,
          is_team: false,
          created_at: 0,
          most_recent_post_created_at: 1,
          members: [1],
        },
        {
          id: 28,
          is_team: true,
          created_at: 28,
          most_recent_post_created_at: 1,
          members: [],
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
        done();
      });
    });

    it('should remove the group from foc when user was removed from current conversation', done => {
      (getGlobalValue as jest.Mock).mockReturnValue(16);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [
        {
          id: 16,
          is_team: true,
          created_at: 16,
          most_recent_post_created_at: 16,
          members: [],
        },
      ] as any);
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.noLongerAMemberOfThisTeam',
          }),
        );
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        done();
      });
    });

    it('should not save the group if this group is a favorite group', done => {
      SectionGroupHandler.getInstance();
      sectionGroupHandler['_oldFavGroupIds'] = [17, 11];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [
        fakeData[11],
        fakeData[17],
      ]);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        done();
      });
    });

    it('should not save the group if this group is a close group and has not UMI', done => {
      SectionGroupHandler.getInstance();
      sectionGroupHandler['_hiddenGroupIds'] = [17, 11];
      getEntity.mockReturnValue({ unreadCount: 0 });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [
        fakeData[11],
        fakeData[17],
      ]);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        done();
      });
    });

    it('should not save the group if this group is a close group and has not UMI', done => {
      SectionGroupHandler.getInstance();
      sectionGroupHandler['_hiddenGroupIds'] = [17, 11];
      getEntity.mockReturnValue({ unreadCount: 1 });
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [
        fakeData[11],
        fakeData[17],
      ]);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 17, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
        done();
      });
    });
  });

  describe('_handleFavoriteIdsChange()', () => {
    const fakeData = [];
    function initData() {
      for (let i = 0; i < 30; i++) {
        fakeData.push({
          id: i,
          is_team: i > 14,
          created_at: i,
          most_recent_post_created_at: i,
          members: [1],
        });
      }
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return { data: [], hasMore: false };
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return { data: fakeData.slice(3, 7), hasMore: false };
          }
          return {
            data: [...fakeData[16], ...fakeData.slice(18, 20)],
            hasMore: true,
          };
        });
      groupService.getGroupsByIds = jest
        .fn()
        .mockImplementation((ids: number[]) => {
          return ids.map((id: number) => fakeData[id]);
        });
    }

    let sectionGroupHandler: SectionGroupHandler;
    beforeEach((done: jest.DoneCallback) => {
      sectionGroupHandler && sectionGroupHandler.dispose();
      clearMocks();
      setup();
      initData();
      sectionGroupHandler = SectionGroupHandler.getInstance();
      sectionGroupHandler.onReady(() => done());
      groupService.isValid = jest.fn().mockImplementation((group: any) => {
        return (
          group && !group.is_archived && !group.deactivated && !!group.members
        );
      });
    });

    afterEach(() => {
      SectionGroupHandler.getInstance().dispose();
      Object.assign(SectionGroupHandler, { _instance: undefined });
    });
    it('should remove from group section if mark as favorite', done => {
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return {
              data: [fakeData[4], fakeData[18], fakeData[20]],
              hasMore: false,
            };
          }
        });
      (getSingleEntity as jest.Mock).mockReturnValue([4, 18, 20]);
      sectionGroupHandler['_handleFavoriteIdsChange']();
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([4, 18, 20]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([6, 5, 3]);
        done();
      });
    });

    it('should add to group section if unread group remove from favorite and has more newer is false', async () => {
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return {
              data: [fakeData[2], fakeData[7], fakeData[21]],
              hasMore: false,
            };
          }
        });
      sectionGroupHandler['_maxLeftRailGroup'] = 3;
      sectionGroupHandler['_oldFavGroupIds'] = [1, 2, 7, 8, 17, 21, 22];
      sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM].setHasMore(
        false,
        QUERY_DIRECTION.NEWER,
      );
      getEntity.mockReturnValue({ unreadCount: 1 });
      (getSingleEntity as jest.Mock).mockReturnValue([2, 7, 21]);
      await sectionGroupHandler['_handleFavoriteIdsChange']();
      expect(
        sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
      ).toEqual([2, 7, 21]);
      expect(sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM)).toEqual([
        22,
        19,
        18,
        17,
        16,
      ]);
      expect(
        sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
      ).toEqual([8, 6, 5, 4, 3, 1]);
    });

    it('should not add to group section if unread group remove from favorite but not in limitation and has more is true', async () => {
      sectionGroupHandler['_maxLeftRailGroup'] = 3;
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return {
              data: [fakeData[2], fakeData[7], fakeData[21]],
              hasMore: false,
            };
          }
        });
      sectionGroupHandler['_maxLeftRailGroup'] = 3;
      sectionGroupHandler['_oldFavGroupIds'] = [1, 2, 7, 8, 15, 17, 21, 22];
      getEntity.mockReturnValue({ unreadCount: 1 });
      (getSingleEntity as jest.Mock).mockReturnValue([2, 7, 21]);
      await sectionGroupHandler['_handleFavoriteIdsChange']();
      expect(
        sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
      ).toEqual([2, 7, 21]);
      expect(sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM)).toEqual([
        22,
        19,
        18,
        17,
        16,
      ]);
      expect(
        sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
      ).toEqual([8, 6, 5, 4, 3, 1]);
    });

    it('should add to group section if without unread group remove from favorite and in limitation', async () => {
      sectionGroupHandler['_maxLeftRailGroup'] = 10;
      sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM].setHasMore(
        false,
        QUERY_DIRECTION.NEWER,
      );
      getEntity.mockReturnValue({ unreadCount: 0 });
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return {
              data: [fakeData[2], fakeData[7], fakeData[21]],
              hasMore: false,
            };
          }
        });
      sectionGroupHandler['_maxLeftRailGroup'] = 3;
      sectionGroupHandler['_oldFavGroupIds'] = [1, 2, 7, 8, 15, 17, 21, 22];
      (getSingleEntity as jest.Mock).mockReturnValue([2, 7, 21]);
      await sectionGroupHandler['_handleFavoriteIdsChange']();
      expect(
        sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
      ).toEqual([2, 7, 21]);
      expect(sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM)).toEqual([
        22,
        19,
        18,
      ]);
      expect(
        sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
      ).toEqual([8, 6, 5, 1]);
    });

    it('should not add to group section if without unread group remove from favorite and not in limitation', async () => {
      sectionGroupHandler['_maxLeftRailGroup'] = 3;
      sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM].setHasMore(
        false,
        QUERY_DIRECTION.NEWER,
      );
      getEntity.mockReturnValue({ unreadCount: 0 });
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return {
              data: [fakeData[2], fakeData[7], fakeData[21]],
              hasMore: false,
            };
          }
        });
      sectionGroupHandler['_maxLeftRailGroup'] = 3;
      sectionGroupHandler['_oldFavGroupIds'] = [1, 2, 7, 8, 15, 17, 21, 22];
      (getSingleEntity as jest.Mock).mockReturnValue([2, 7, 21]);
      await sectionGroupHandler['_handleFavoriteIdsChange']();
      expect(
        sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
      ).toEqual([2, 7, 21]);
      expect(sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM)).toEqual([
        22,
        19,
        18,
      ]);
      expect(
        sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
      ).toEqual([8, 6, 5, 1]);
    });
  });

  describe('_handleHiddenIdsChange()', () => {
    const fakeData = [];
    function initData() {
      for (let i = 0; i < 30; i++) {
        fakeData.push({
          id: i,
          is_team: i > 14,
          created_at: i,
          most_recent_post_created_at: i,
          members: [1],
        });
      }
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return { data: [], hasMore: false };
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return { data: fakeData.slice(3, 7), hasMore: false };
          }
          return {
            data: [...fakeData[16], ...fakeData.slice(18, 20)],
            hasMore: true,
          };
        });
    }

    let sectionGroupHandler: SectionGroupHandler;
    beforeEach((done: jest.DoneCallback) => {
      clearMocks();
      setup();
      initData();
      sectionGroupHandler = SectionGroupHandler.getInstance();
      sectionGroupHandler.onReady(() => done());
      groupService.isValid = jest.fn().mockImplementation((group: any) => {
        return (
          group && !group.is_archived && !group.deactivated && !!group.members
        );
      });
    });

    afterEach(() => {
      SectionGroupHandler.getInstance().dispose();
      Object.assign(SectionGroupHandler, { _instance: undefined });
    });

    it('should remove from group section if close the conversation', done => {
      sectionGroupHandler['_hiddenGroupIds'] = [1, 2, 22];
      sectionGroupHandler['_handleHiddenIdsChange']([1, 2, 5, 18, 22]);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([6, 4, 3]);
        done();
      });
    });
  });

  describe('Group state change notification', () => {
    const fakeData = [];
    function initData() {
      for (let i = 0; i < 30; i++) {
        fakeData.push({
          id: i,
          is_team: i > 14,
          created_at: i,
          most_recent_post_created_at: i,
          members: [1],
        });
      }
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation((groupType: GROUP_QUERY_TYPE) => {
          if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
            return { data: [], hasMore: false };
          }
          if (groupType === GROUP_QUERY_TYPE.GROUP) {
            return { data: fakeData.slice(2, 11), hasMore: false };
          }
          return {
            data: [...fakeData[16], ...fakeData.slice(18, 20)],
            hasMore: true,
          };
        });
    }

    let sectionGroupHandler: SectionGroupHandler;
    beforeEach((done: jest.DoneCallback) => {
      clearMocks();
      setup();
      initData();
      sectionGroupHandler = SectionGroupHandler.getInstance();
      sectionGroupHandler.onReady(() => done());
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      groupService.isValid = jest.fn().mockImplementation((group: any) => {
        return (
          group && !group.is_archived && !group.deactivated && !!group.members
        );
      });
      groupService.getGroupsByIds = jest
        .fn()
        .mockImplementation((ids: number[]) => {
          return ids.map((id: number) => fakeData[id]);
        });
    });

    afterEach(() => {
      sectionGroupHandler.dispose();
      Object.assign(SectionGroupHandler, { _instance: undefined });
    });

    it('should not update the foc for unread groups which in left rail', done => {
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        { id: 3, unread_count: 1 },
        { id: 5, unread_count: 1 },
        { id: 16, unread_count: 1 },
        { id: 19, unread_count: 1 },
      ]);
      const foc = sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM];
      const removeSpy = jest.spyOn(foc, 'removeByIds');
      const upsertSpy = jest.spyOn(foc, 'upsert');
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        expect(removeSpy).not.toHaveBeenCalled();
        expect(upsertSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should update the foc for unread groups which not in left rail and in range', done => {
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        { id: 11, unread_count: 1 },
        { id: 12, unread_count: 1 },
        { id: 17, unread_count: 1 },
        { id: 20, unread_count: 1 },
      ]);
      const foc = sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM];
      const removeSpy = jest.spyOn(foc, 'removeByIds');
      const upsertSpy = jest.spyOn(foc, 'upsert');
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([20, 19, 18, 17, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        expect(removeSpy).not.toHaveBeenCalled();
        expect(upsertSpy).toHaveBeenCalledWith([
          fakeData[11],
          fakeData[12],
          fakeData[17],
          fakeData[20],
        ]);
        done();
      });
    });

    it('should not update the team foc for unread groups which not in left rail but not in range', done => {
      sectionGroupHandler['_maxLeftRailGroup'] = 3;
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        { id: 1, unread_count: 1 },
        { id: 0, unread_count: 1 },
        { id: 15, unread_count: 1 },
        { id: 17, unread_count: 1 },
      ]);
      const foc = sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM];
      const removeSpy = jest.spyOn(foc, 'removeByIds');
      const upsertSpy = jest.spyOn(foc, 'upsert');
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 17, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        expect(removeSpy).not.toHaveBeenCalled();
        expect(upsertSpy).toHaveBeenCalledWith([
          fakeData[1],
          fakeData[0],
          fakeData[15],
          fakeData[17],
        ]);
        done();
      });
    });

    it('should not update foc for not unread count groups which not in left rail', done => {
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        { id: 1, unread_count: 0 },
        { id: 0, unread_count: 0 },
        { id: 15, unread_count: 0 },
        { id: 17, unread_count: 0 },
      ]);
      const foc = sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM];
      const removeSpy = jest.spyOn(foc, 'removeByIds');
      const upsertSpy = jest.spyOn(foc, 'upsert');
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        expect(removeSpy).not.toHaveBeenCalled();
        expect(upsertSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not update foc for not unread count groups which in left rail', done => {
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        { id: 8, unread_count: 0 },
        { id: 6, unread_count: 0 },
        { id: 19, unread_count: 0 },
        { id: 16, unread_count: 0 },
      ]);
      const foc = sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM];
      const removeSpy = jest.spyOn(foc, 'removeByIds');
      const upsertSpy = jest.spyOn(foc, 'upsert');
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        expect(removeSpy).not.toHaveBeenCalled();
        expect(upsertSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should remove not unread count groups which in left rail and out of limitation', done => {
      sectionGroupHandler['_maxLeftRailGroup'] = 2;
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        { id: 8, unread_count: 0 },
        { id: 6, unread_count: 0 },
        { id: 11, unread_count: 1 },
        { id: 17, unread_count: 1 },
        { id: 16, unread_count: 0 },
      ]);
      const teamFoc = sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM];
      const dmFoc =
        sectionGroupHandler['_handlersMap'][SECTION_TYPE.DIRECT_MESSAGE];
      const teamRemoveSpy = jest.spyOn(teamFoc, 'removeByIds');
      const teamUpsertSpy = jest.spyOn(teamFoc, 'upsert');
      const dmRemoveSpy = jest.spyOn(dmFoc, 'removeByIds');
      const dmUpsertSpy = jest.spyOn(dmFoc, 'upsert');
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 17]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([11, 10, 9, 7, 5, 4, 3, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        expect(teamUpsertSpy).toHaveBeenCalledWith([
          fakeData[11],
          fakeData[17],
        ]);
        expect(dmUpsertSpy).toHaveBeenCalledWith([fakeData[11], fakeData[17]]);
        expect(teamRemoveSpy).toHaveBeenCalledWith([16]);
        expect(dmRemoveSpy).toHaveBeenCalledWith([8, 6]);
        done();
      });
    });

    it('should not add group in which has not post and did not created by current user when receive group state notification', done => {
      (getGlobalValue as jest.Mock).mockReturnValue(1);
      SectionGroupHandler.getInstance();
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        {
          id: 22,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
          unread_count: 1,
        },
      ]);
      fakeData[22].creator_id = 3;
      fakeData[22].members = [3];
      const teamFoc = sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM];
      const dmFoc =
        sectionGroupHandler['_handlersMap'][SECTION_TYPE.DIRECT_MESSAGE];
      const teamRemoveSpy = jest.spyOn(teamFoc, 'removeByIds');
      const teamUpsertSpy = jest.spyOn(teamFoc, 'upsert');
      const dmRemoveSpy = jest.spyOn(dmFoc, 'removeByIds');
      const dmUpsertSpy = jest.spyOn(dmFoc, 'upsert');
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        expect(teamUpsertSpy).toHaveBeenCalledWith([fakeData[22]]);
        expect(dmUpsertSpy).toHaveBeenCalledWith([fakeData[22]]);
        expect(teamRemoveSpy).not.toHaveBeenCalled();
        expect(dmRemoveSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not add group in which has not post and did not created by current user when receive group state notification', done => {
      (getGlobalValue as jest.Mock).mockReturnValueOnce(1);
      SectionGroupHandler.getInstance();
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        {
          id: 22,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
          unread_count: 1,
        },
      ]);
      fakeData[22].creator_id = 3;
      fakeData[22].members = [3];
      const teamFoc = sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM];
      const dmFoc =
        sectionGroupHandler['_handlersMap'][SECTION_TYPE.DIRECT_MESSAGE];
      const teamRemoveSpy = jest.spyOn(teamFoc, 'removeByIds');
      const teamUpsertSpy = jest.spyOn(teamFoc, 'upsert');
      const dmRemoveSpy = jest.spyOn(dmFoc, 'removeByIds');
      const dmUpsertSpy = jest.spyOn(dmFoc, 'upsert');
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        expect(teamUpsertSpy).toHaveBeenCalledWith([fakeData[22]]);
        expect(dmUpsertSpy).toHaveBeenCalledWith([fakeData[22]]);
        expect(teamRemoveSpy).not.toHaveBeenCalled();
        expect(dmRemoveSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not add to foc which group is archived when receive group state notification', done => {
      SectionGroupHandler.getInstance();
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        {
          id: 22,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
          unread_count: 1,
        },
        {
          id: 11,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
          unread_count: 1,
        },
      ]);
      fakeData[22].is_archived = true;
      fakeData[11].is_archived = true;
      const teamFoc = sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM];
      const dmFoc =
        sectionGroupHandler['_handlersMap'][SECTION_TYPE.DIRECT_MESSAGE];
      const teamRemoveSpy = jest.spyOn(teamFoc, 'removeByIds');
      const teamUpsertSpy = jest.spyOn(teamFoc, 'upsert');
      const dmRemoveSpy = jest.spyOn(dmFoc, 'removeByIds');
      const dmUpsertSpy = jest.spyOn(dmFoc, 'upsert');
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        expect(teamUpsertSpy).not.toHaveBeenCalled();
        expect(dmUpsertSpy).not.toHaveBeenCalled();
        expect(teamRemoveSpy).not.toHaveBeenCalled();
        expect(dmRemoveSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not save deactivated to foc when receive group state notification', done => {
      SectionGroupHandler.getInstance();
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        {
          id: 22,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
          unread_count: 1,
        },
        {
          id: 11,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
          unread_count: 1,
        },
      ]);
      fakeData[22].deactivated = true;
      fakeData[11].deactivated = true;
      const teamFoc = sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM];
      const dmFoc =
        sectionGroupHandler['_handlersMap'][SECTION_TYPE.DIRECT_MESSAGE];
      const teamRemoveSpy = jest.spyOn(teamFoc, 'removeByIds');
      const teamUpsertSpy = jest.spyOn(teamFoc, 'upsert');
      const dmRemoveSpy = jest.spyOn(dmFoc, 'removeByIds');
      const dmUpsertSpy = jest.spyOn(dmFoc, 'upsert');
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        expect(teamUpsertSpy).not.toHaveBeenCalled();
        expect(dmUpsertSpy).not.toHaveBeenCalled();
        expect(teamRemoveSpy).not.toHaveBeenCalled();
        expect(dmRemoveSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not save the group which has not member list to foc when receive group state notification', done => {
      SectionGroupHandler.getInstance();
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [
        {
          id: 22,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
          unread_count: 1,
        },
        {
          id: 11,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
          unread_count: 1,
        },
      ]);
      fakeData[22].members = [];
      fakeData[11].members = [];
      const teamFoc = sectionGroupHandler['_handlersMap'][SECTION_TYPE.TEAM];
      const dmFoc =
        sectionGroupHandler['_handlersMap'][SECTION_TYPE.DIRECT_MESSAGE];
      const teamRemoveSpy = jest.spyOn(teamFoc, 'removeByIds');
      const teamUpsertSpy = jest.spyOn(teamFoc, 'upsert');
      const dmRemoveSpy = jest.spyOn(dmFoc, 'removeByIds');
      const dmUpsertSpy = jest.spyOn(dmFoc, 'upsert');
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual([19, 18, 16]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE),
        ).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2]);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        expect(teamUpsertSpy).not.toHaveBeenCalled();
        expect(dmUpsertSpy).not.toHaveBeenCalled();
        expect(teamRemoveSpy).not.toHaveBeenCalled();
        expect(dmRemoveSpy).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('fetchPagination()', () => {
    const fakeData = [];
    function initData() {
      for (let i = 0; i < 100; i++) {
        fakeData.push({
          id: i,
          is_team: i > 49,
          created_at: i,
          most_recent_post_created_at: i,
          members: [1],
        });
      }
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation(
          (
            groupType: GROUP_QUERY_TYPE,
            offset: number = 0,
            limit: number,
            pageSize?: number,
          ) => {
            if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
              return { data: [], hasMore: false };
            }
            if (groupType === GROUP_QUERY_TYPE.GROUP) {
              return { data: fakeData.slice(1, 50), hasMore: false };
            }
            return {
              data: fakeData.slice(offset, offset + (pageSize || 0)),
              hasMore: true,
            };
          },
        );
    }

    let sectionGroupHandler: SectionGroupHandler;
    beforeEach((done: jest.DoneCallback) => {
      clearMocks();
      setup();
      initData();

      sectionGroupHandler = SectionGroupHandler.getInstance();
      sectionGroupHandler.onReady(() => done());
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      groupService.isValid = jest.fn().mockImplementation((group: any) => {
        return (
          group && !group.is_archived && !group.deactivated && !!group.members
        );
      });
      groupService.getGroupsByIds = jest
        .fn()
        .mockImplementation((ids: number[]) => {
          return ids.map((id: number) => fakeData[id]);
        });
    });

    afterEach(() => {
      SectionGroupHandler.getInstance().dispose();
      Object.assign(SectionGroupHandler, { _instance: undefined });
    });

    it('should just initial the first page of team', done => {
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM).length,
        ).toEqual(20);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE)
            .length,
        ).toEqual(49);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        done();
      });
    });

    it('should get teams by pagination', done => {
      sectionGroupHandler.fetchPagination(SECTION_TYPE.TEAM);
      const ids: number[] = [];
      for (let i = 38; i >= 0; i--) {
        ids.push(i);
      }

      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual(ids);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE)
            .length,
        ).toEqual(49);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        done();
      });
    });
  });

  describe('setLeftRailVisible()', () => {
    const fakeData = [];
    function initData() {
      for (let i = 0; i < 100; i++) {
        fakeData.push({
          id: i,
          is_team: i > 49,
          created_at: i,
          most_recent_post_created_at: i,
          members: [1],
        });
      }
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation(
          (
            groupType: GROUP_QUERY_TYPE,
            offset: number = 0,
            limit: number,
            pageSize?: number,
          ) => {
            if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
              return { data: [], hasMore: false };
            }
            if (groupType === GROUP_QUERY_TYPE.GROUP) {
              return { data: fakeData.slice(1, 50), hasMore: false };
            }
            return {
              data: fakeData.slice(offset, offset + (pageSize || 0)),
              hasMore: true,
            };
          },
        );
    }

    let sectionGroupHandler: SectionGroupHandler;
    beforeEach((done: jest.DoneCallback) => {
      clearMocks();
      setup();
      initData();

      sectionGroupHandler = SectionGroupHandler.getInstance();
      sectionGroupHandler.onReady(() => done());
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      groupService.isValid = jest.fn().mockImplementation((group: any) => {
        return (
          group && !group.is_archived && !group.deactivated && !!group.members
        );
      });
      groupService.getGroupsByIds = jest
        .fn()
        .mockImplementation((ids: number[]) => {
          return ids.map((id: number) => fakeData[id]);
        });
    });

    afterEach(() => {
      SectionGroupHandler.getInstance().dispose();
      Object.assign(SectionGroupHandler, { _instance: undefined });
    });

    it('should release cache when left rail invisible', done => {
      const ids: number[] = [];
      for (let i = 38; i >= 0; i--) {
        ids.push(i);
      }
      sectionGroupHandler.fetchPagination(SECTION_TYPE.TEAM);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual(ids);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE)
            .length,
        ).toEqual(49);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        sectionGroupHandler.setLeftRailVisible(false);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual(ids.slice(0, 20));
        done();
      });
    });

    it('should not release cache when left rail visible', done => {
      const ids: number[] = [];
      for (let i = 38; i >= 0; i--) {
        ids.push(i);
      }
      sectionGroupHandler.fetchPagination(SECTION_TYPE.TEAM);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual(ids);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE)
            .length,
        ).toEqual(49);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        sectionGroupHandler.setLeftRailVisible(true);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual(ids);
        done();
      });
    });
  });

  describe('hasMore()', () => {
    const fakeData = [];
    function initData() {
      for (let i = 0; i < 100; i++) {
        fakeData.push({
          id: i,
          is_team: i > 49,
          created_at: i,
          most_recent_post_created_at: i,
          members: [1],
        });
      }
      groupService.getGroupsByType = jest
        .fn()
        .mockImplementation(
          (
            groupType: GROUP_QUERY_TYPE,
            offset: number = 0,
            limit: number,
            pageSize?: number,
          ) => {
            if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
              return { data: [], hasMore: false };
            }
            if (groupType === GROUP_QUERY_TYPE.GROUP) {
              return { data: fakeData.slice(1, 50), hasMore: false };
            }
            return {
              data: fakeData.slice(offset, offset + (pageSize || 0)),
              hasMore: true,
            };
          },
        );
    }

    let sectionGroupHandler: SectionGroupHandler;
    beforeEach((done: jest.DoneCallback) => {
      clearMocks();
      setup();
      initData();

      sectionGroupHandler = SectionGroupHandler.getInstance();
      sectionGroupHandler.onReady(() => done());
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      groupService.isValid = jest.fn().mockImplementation((group: any) => {
        return (
          group && !group.is_archived && !group.deactivated && !!group.members
        );
      });
      groupService.getGroupsByIds = jest
        .fn()
        .mockImplementation((ids: number[]) => {
          return ids.map((id: number) => fakeData[id]);
        });
    });

    afterEach(() => {
      SectionGroupHandler.getInstance().dispose();
      Object.assign(SectionGroupHandler, { _instance: undefined });
    });

    it('should get the right has more value', done => {
      setTimeout(() => {
        expect(
          sectionGroupHandler.hasMore(SECTION_TYPE.TEAM, QUERY_DIRECTION.OLDER),
        ).toEqual(false);
        expect(
          sectionGroupHandler.hasMore(SECTION_TYPE.TEAM, QUERY_DIRECTION.NEWER),
        ).toEqual(true);
        expect(
          sectionGroupHandler.hasMore(
            SECTION_TYPE.DIRECT_MESSAGE,
            QUERY_DIRECTION.OLDER,
          ),
        ).toEqual(false);
        expect(
          sectionGroupHandler.hasMore(
            SECTION_TYPE.DIRECT_MESSAGE,
            QUERY_DIRECTION.NEWER,
          ),
        ).toEqual(false);
        done();
      });
    });

    it('should not release cache when left rail visible', done => {
      const ids: number[] = [];
      for (let i = 38; i >= 0; i--) {
        ids.push(i);
      }
      sectionGroupHandler.fetchPagination(SECTION_TYPE.TEAM);
      setTimeout(() => {
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual(ids);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.DIRECT_MESSAGE)
            .length,
        ).toEqual(49);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.FAVORITE),
        ).toEqual([]);
        sectionGroupHandler.setLeftRailVisible(true);
        expect(
          sectionGroupHandler.getGroupIdsByType(SECTION_TYPE.TEAM),
        ).toEqual(ids);
        done();
      });
    });
  });

  describe('preFetch group data()', () => {
    let sectionGroupHandler: SectionGroupHandler;
    beforeEach(() => {
      clearMocks();
      setup();
      sectionGroupHandler = SectionGroupHandler.getInstance();
    });

    afterEach(() => {
      SectionGroupHandler.getInstance().dispose();
      Object.assign(SectionGroupHandler, { _instance: undefined });
    });

    it('should call addProcessor twice when sectionType is favorites', async () => {
      const preFetchConversationDataHandler = PreFetchConversationDataHandler.getInstance();
      const direction = QUERY_DIRECTION.OLDER;
      const sectionType = SECTION_TYPE.FAVORITE;
      jest
        .spyOn(sectionGroupHandler._handlersMap[sectionType], 'fetchData')
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
      const addProcessorSpy = jest.spyOn(
        preFetchConversationDataHandler,
        'addProcessor',
      );
      await sectionGroupHandler.fetchGroups(sectionType, direction);
      expect(addProcessorSpy).toHaveBeenCalledTimes(2);
    });

    it('should call addProcessor twice when sectionType is direct_messages and state.unread_count is 2', async (done: any) => {
      const preFetchConversationDataHandler = PreFetchConversationDataHandler.getInstance();
      const sectionType = SECTION_TYPE.DIRECT_MESSAGE;
      jest
        .spyOn(
          sectionGroupHandler._handlersMap[SECTION_TYPE.TEAM],
          'setPageSize',
        )
        .mockReturnValue();
      jest
        .spyOn(sectionGroupHandler._handlersMap[sectionType], 'fetchData')
        .mockResolvedValue([{ id: 1 }, { id: 2 }]);
      jest
        .spyOn(stateService, 'batchGet')
        .mockResolvedValue([{id: 1, unread_count: 2 }, {id: 2, unread_count: 2 }]);
      const addProcessorSpy = jest.spyOn(
        preFetchConversationDataHandler,
        'addProcessor',
      );
      setTimeout(() => {
        expect(addProcessorSpy).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should call addProcessor twice when sectionType is teams and state.unread_mentions_count is 2', async (done: any) => {
      const preFetchConversationDataHandler = PreFetchConversationDataHandler.getInstance();
      const direction = QUERY_DIRECTION.OLDER;
      const sectionType = SECTION_TYPE.TEAM;
      jest
        .spyOn(sectionGroupHandler._handlersMap[sectionType], 'fetchData')
        .mockResolvedValue([{ id: 1 }, { id: 2 }]);
      jest
        .spyOn(stateService, 'batchGet')
        .mockResolvedValue([{id: 1, unread_count: 2 }, {id: 2, unread_count: 2 }]);
      const addProcessorSpy = jest.spyOn(
        preFetchConversationDataHandler,
        'addProcessor',
      );
      await sectionGroupHandler.fetchGroups(sectionType, direction);
      setTimeout(() => {
        expect(addProcessorSpy).toHaveBeenCalledTimes(2);
        done();
      });
    });
  });

  describe('removeOverLimitGroupByChangingCurrentGroupId()', () => {
    function setup({
      lastGroupId,
      groupIds,
      limit,
      lastGroupHasUnread,
    }: {
      lastGroupId: number;
      groupIds: number[];
      limit: number;
      lastGroupHasUnread: boolean;
    }) {
      const sectionGroupHandler = SectionGroupHandler.getInstance();
      const directMessageHandler = { removeByIds: jest.fn() };
      const teamHandler = { removeByIds: jest.fn() };
      Object.assign(sectionGroupHandler, {
        _lastGroupId: lastGroupId,
        _handlersMap: {
          [SECTION_TYPE.DIRECT_MESSAGE]: directMessageHandler,
          [SECTION_TYPE.TEAM]: teamHandler,
        },
      });
      jest
        .spyOn(sectionGroupHandler, 'getGroupIdsByType')
        .mockReturnValue(groupIds);
      jest
        .spyOn<SectionGroupHandler, any>(
          sectionGroupHandler,
          '_handleFavoriteIdsChange',
        )
        .mockImplementation(() => {});
      jest
        .spyOn<SectionGroupHandler, any>(
          sectionGroupHandler,
          '_handleHiddenIdsChange',
        )
        .mockImplementation(() => {});
      sectionGroupHandler['_maxLeftRailGroup'] = limit;
      return { sectionGroupHandler, directMessageHandler, teamHandler };
    }

    afterEach(() => {
      SectionGroupHandler.getInstance().dispose();
      Object.assign(SectionGroupHandler, { _instance: undefined });
    });

    it('should not remove last group if it over limit but has unread', async () => {
      const { sectionGroupHandler, directMessageHandler } = setup({
        groupIds: [1, 2, 3, 4, 5, 6, 7],
        limit: 5,
        lastGroupId: 7,
        lastGroupHasUnread: true,
      });
      await sectionGroupHandler.removeOverLimitGroupByChangingCurrentGroupId();
      expect(directMessageHandler.removeByIds).not.toHaveBeenCalled();
    });

    it('should not remove last group if it did not over limit', async () => {
      const { sectionGroupHandler, directMessageHandler } = setup({
        groupIds: [1, 2, 3, 4, 5, 6, 7],
        limit: 5,
        lastGroupId: 5,
        lastGroupHasUnread: false,
      });
      await sectionGroupHandler.removeOverLimitGroupByChangingCurrentGroupId();
      expect(directMessageHandler.removeByIds).not.toHaveBeenCalled();
    });
  });

  describe('checkIfGroupOpenedFromHidden', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    afterEach(() => {
      SectionGroupHandler.getInstance().dispose();
      Object.assign(SectionGroupHandler, { _instance: undefined });
    });

    it('should not change because of more hidden group ids', async () => {
      const handler = SectionGroupHandler.getInstance();
      await handler.checkIfGroupOpenedFromHidden([], [1]);
      expect(handler.groupIds.length).toBe(0);
    });

    it('should add groups because of less hidden group ids', async () => {
      const handler = SectionGroupHandler.getInstance();
      (groupService.getGroupsByIds as jest.Mock).mockResolvedValue([
        {
          id: 3,
          company_id: 1,
          is_team: false,
          members: [],
        },
      ]);
      await handler.checkIfGroupOpenedFromHidden([1, 2], [1]);
      expect(handler.groupIds.length).toBe(0);
    });
  });

  describe('Basic functions/configs', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    afterEach(() => {
      SectionGroupHandler.getInstance().dispose();
      Object.assign(SectionGroupHandler, { _instance: undefined });
    });
    it('getInstance', () => {
      expect(SectionGroupHandler.getInstance() !== undefined).toBeTruthy();
    });
    it('groupIds', () => {
      expect(SectionGroupHandler.getInstance().groupIds.length).toEqual(0);
    });
    it('getGroupIdsByType', () => {
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.FAVORITE,
        ),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(SECTION_TYPE.TEAM),
      ).toEqual([]);
    });
  });
});
