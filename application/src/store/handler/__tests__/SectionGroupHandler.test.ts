/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-29 10:47:27
 * Copyright © RingCentral. All rights reserved.
 */
import { getGlobalValue, getEntity } from '../../utils/entities';
import SectionGroupHandler from '../SectionGroupHandler';
import { SECTION_TYPE } from '@/containers/LeftRail/Section/types';
import { ProfileService } from 'sdk/module/profile';
import { StateService } from 'sdk/module/state';
import { GroupService } from 'sdk/module/group';
import { notificationCenter, ENTITY } from 'sdk/service';
import { QUERY_DIRECTION } from 'sdk/dao';
import preFetchConversationDataHandler from '../PreFetchConversationDataHandler';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

jest.mock('../PreFetchConversationDataHandler');
jest.mock('sdk/api');
jest.mock('sdk/module/profile');
jest.mock('sdk/module/state');
jest.mock('sdk/module/group');
jest.mock('../../utils/entities');

const profileService = new ProfileService();
const stateService = new StateService();
const groupService = new GroupService();

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();

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

      return null;
    });

  Object.assign(SectionGroupHandler, { _instance: undefined });
  (profileService.getProfile as jest.Mock).mockResolvedValue({});
  (getGlobalValue as jest.Mock).mockReturnValue(1);
  getEntity.mockReturnValue({ unreadCount: 0 });
});

afterEach(() => {
  SectionGroupHandler.getInstance().dispose();
});

describe('SectionGroupHandler', () => {
  describe('_removeGroupsIfExistedInHiddenGroups', () => {
    it('should not remove unread conversation', () => {
      SectionGroupHandler.getInstance()['_hiddenGroupIds'] = [123, 456];
      SectionGroupHandler.getInstance()['_handlersMap'] = {};
      SectionGroupHandler.getInstance()['_handlersMap'][
        SECTION_TYPE.DIRECT_MESSAGE
] = {};
      getEntity.mockReturnValueOnce({ unreadCount: 1 });
      jest
        .spyOn(SectionGroupHandler.getInstance(), 'getGroupIdsByType')
        .mockReturnValueOnce([123, 456, 789]);
      SectionGroupHandler.getInstance()['_removeByIds'] = jest.fn();
      SectionGroupHandler.getInstance()['_updateUrl'] = jest.fn();
      SectionGroupHandler.getInstance()[ '_removeGroupsIfExistedInHiddenGroups'
]();
      expect(SectionGroupHandler.getInstance()['_removeByIds']).toBeCalledWith(
        SECTION_TYPE.DIRECT_MESSAGE,
        [456],
      );
    });
  });

  describe('Basic functions/configs', () => {
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

  describe('Group change notification', () => {
    groupService.isValid.mockImplementation((group: any) => {
      return (
        group && !group.is_archived && !group.deactivated && !!group.members
      );
    });
    it('entity put', () => {
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
          id: 2,
          is_team: true,
          created_at: 0,
          most_recent_post_created_at: 1,
          members: [1],
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      expect(SectionGroupHandler.getInstance().groupIds.sort()).toEqual([1, 2]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(SECTION_TYPE.TEAM),
      ).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([1]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.FAVORITE,
        ),
      ).toEqual([]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [1, 2]);
    });

    it('entity delete id not in id sets', () => {
      SectionGroupHandler.getInstance();
      const putData = [
        {
          id: 2,
          is_team: true,
          created_at: 0,
          members: [1],
        },
      ];
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, putData);
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([2]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [3]);
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance()
          .getGroupIdsByType(SECTION_TYPE.TEAM)
          .sort(),
      ).toEqual([2]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [2]);
    });

    it('entity delete id in id sets', () => {
      SectionGroupHandler.getInstance();
      const putData = [
        {
          id: 2,
          is_team: true,
          created_at: 0,
          members: [1],
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, putData);
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(SECTION_TYPE.TEAM),
      ).toEqual([2]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [2]);
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(SECTION_TYPE.TEAM),
      ).toEqual([]);
    });

    it('should not add this group in because it has not post and not created by current user', () => {
      SectionGroupHandler.getInstance();
      const fakeData = [
        {
          id: 1,
          is_team: false,
          created_at: 0,
          creator_id: 2,
          members: [1],
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      expect(SectionGroupHandler.getInstance().groupIds.sort()).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(SECTION_TYPE.TEAM),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.FAVORITE,
        ),
      ).toEqual([]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [1]);
    });
    it('should add this team in because it has not post but created by current user', () => {
      (getGlobalValue as jest.Mock).mockReturnValue(3);
      SectionGroupHandler.getInstance();
      const fakeData = [
        {
          id: 11111,
          is_team: false,
          created_at: 0,
          creator_id: 3,
          members: [3],
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([11111]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([11111]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [11111]);
    });

    it('should id sets not change when entity archive id not in id sets', () => {
      SectionGroupHandler.getInstance();
      const putData = [
        {
          id: 2,
          is_team: true,
          created_at: 0,
          members: [1],
        },
      ];
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, putData);
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([2]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [
        {
          id: 3,
          is_team: true,
          created_at: 0,
          is_archived: true,
        },
      ]);
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance()
          .getGroupIdsByType(SECTION_TYPE.TEAM)
          .sort(),
      ).toEqual([2]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [2]);
    });

    it('should delete id from id sets when entity archived in id sets', () => {
      SectionGroupHandler.getInstance();
      const putData = [
        {
          id: 2,
          is_team: true,
          created_at: 0,
          members: [1],
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, putData);
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(SECTION_TYPE.TEAM),
      ).toEqual([2]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, [
        {
          id: 2,
          is_team: true,
          created_at: 0,
          is_archived: true,
        },
      ]);
      expect(SectionGroupHandler.getInstance().groupIds).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(SECTION_TYPE.TEAM),
      ).toEqual([]);
    });

    it('should not include deactivated data when update group', () => {
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
          id: 2,
          is_team: true,
          created_at: 0,
          most_recent_post_created_at: 1,
          members: [1],
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      expect(SectionGroupHandler.getInstance().groupIds.sort()).toEqual([1, 2]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(SECTION_TYPE.TEAM),
      ).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([1]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.FAVORITE,
        ),
      ).toEqual([]);

      fakeData[0]['deactivated'] = true;
      fakeData[1]['deactivated'] = true;
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      expect(SectionGroupHandler.getInstance().groupIds.sort()).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(SECTION_TYPE.TEAM),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIdsByType(
          SECTION_TYPE.FAVORITE,
        ),
      ).toEqual([]);
    });
  });
  describe('getRemovedIds', () => {
    it('should return [] because its length less or equal than limit', () => {
      const result = SectionGroupHandler.getInstance().getRemovedIds(
        [],
        [1, 2],
        2,
        1,
      );
      expect(result.length).toBe(0);
    });
    it('should return [] because over group limit has unread', () => {
      const result = SectionGroupHandler.getInstance().getRemovedIds(
        [{ id: 3 }],
        [1, 2, 3],
        2,
        0,
      );
      expect(result.length).toBe(0);
    });
    it('should return [] because over group is current group', () => {
      const result = SectionGroupHandler.getInstance().getRemovedIds(
        [],
        [1, 2, 3],
        2,
        3,
      );
      expect(result.length).toBe(0);
    });
    it('should return [3,4] because over group has not unread and is not current group', () => {
      const result = SectionGroupHandler.getInstance().getRemovedIds(
        [],
        [1, 2, 3, 4, 5],
        2,
        5,
      );
      expect(result.length).toBe(2);
    });
  });

  describe('removeOverLimitGroupByChangingIds()', () => {
    function setup({
      ids,
      removedIds,
    }: {
      ids: number[];
      removedIds: number[];
    }) {
      const sectionGroupHandler = SectionGroupHandler.getInstance();
      const directMessageHandler = { removeByIds: jest.fn() };
      const teamHandler = { removeByIds: jest.fn() };
      Object.assign(sectionGroupHandler, {
        _lastGroupId: 1,
        _handlersMap: {
          [SECTION_TYPE.DIRECT_MESSAGE]: directMessageHandler,
          [SECTION_TYPE.TEAM]: teamHandler,
        },
      });
      jest.spyOn(sectionGroupHandler, 'getGroupIdsByType').mockReturnValue(ids);
      jest
        .spyOn(sectionGroupHandler, 'getRemovedIds')
        .mockReturnValue(removedIds);

      return { sectionGroupHandler, directMessageHandler, teamHandler };
    }

    it('should remove overflow ids', async () => {
      const { sectionGroupHandler, directMessageHandler, teamHandler } = setup({
        ids: [1, 2, 3],
        removedIds: [2, 3],
      });
      await sectionGroupHandler.removeOverLimitGroupByChangingIds();
      expect(directMessageHandler.removeByIds).toHaveBeenCalledWith([2, 3]);
      expect(teamHandler.removeByIds).toHaveBeenCalledWith([2, 3]);
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
        .spyOn(sectionGroupHandler, 'removeOverLimitGroupByChangingIds')
        .mockImplementation(() => {});
      jest
        .spyOn<SectionGroupHandler, any>(
          sectionGroupHandler,
          '_hasUnreadInGroups',
        )
        .mockReturnValue(lastGroupHasUnread);
      jest
        .spyOn<SectionGroupHandler, any>(
          sectionGroupHandler,
          '_profileUpdateGroupSections',
        )
        .mockImplementation(() => {});
      jest
        .spyOn<SectionGroupHandler, any>(
          sectionGroupHandler,
          '_updateHiddenGroupIds',
        )
        .mockImplementation(() => {});
      (profileService.getMaxLeftRailGroup as jest.Mock).mockResolvedValue(
        limit,
      );
      return { sectionGroupHandler, directMessageHandler, teamHandler };
    }

    it('should remove last group if it over limit and no unread', async () => {
      const { sectionGroupHandler, directMessageHandler } = setup({
        lastGroupId: 7,
        groupIds: [1, 2, 3, 4, 5, 6, 7],
        limit: 5,
        lastGroupHasUnread: false,
      });
      await sectionGroupHandler.removeOverLimitGroupByChangingCurrentGroupId();
      expect(directMessageHandler.removeByIds).toHaveBeenCalledWith([7]);
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
  describe('handleIncomesGroupState', () => {
    function setup(ids: number[]) {
      const handler = SectionGroupHandler.getInstance();
      jest
        .spyOn<SectionGroupHandler, any>(handler, '_profileUpdateGroupSections')
        .mockImplementation(() => {});
      jest
        .spyOn<SectionGroupHandler, any>(handler, '_updateHiddenGroupIds')
        .mockImplementation(() => {});
      jest
        .spyOn<SectionGroupHandler, any>(
          handler,
          'removeOverLimitGroupByChangingIds',
        )
        .mockImplementation(() => {});
      jest
        .spyOn<SectionGroupHandler, any>(
          handler,
          'removeOverLimitGroupByChangingCurrentGroupId',
        )
        .mockImplementation(() => {});

      return handler;
    }
    it('should do nothing because idset is empty', async () => {
      const handler = setup([]);
      expect(handler.groupIds.length).toBe(0);
    });
    it('should do nothing because not body', async () => {
      const handler = setup([1, 2]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [], []);
      expect(handler.groupIds.length).toBe(0);
    });
    it('should do nothing because this group has already in idset and not over limit', async () => {
      const handler = setup([1, 2]);
      notificationCenter.emitEntityUpdate(
        ENTITY.GROUP_STATE,
        [{ id: 1, unread_count: 1 }],
        [],
      );
      expect(handler.groupIds.length).toBe(0);
    });
    it('should do nothing because not unread count and not over limit', async () => {
      const handler = setup([1, 2]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [{ id: 1 }], []);
      expect(handler.groupIds.length).toBe(0);
    });

    it.skip('should add id into id set', done => {
      jest.spyOn(groupService, 'getGroupsByType').mockResolvedValue([]);
      jest.spyOn(groupService, 'getGroupsByIds').mockResolvedValue([
        {
          id: 3,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
        },
      ]);
      const handler = setup([1, 2]);
      setTimeout(() => {
        notificationCenter.emitEntityUpdate(
          ENTITY.GROUP_STATE,
          [{ id: 3, unread_count: 1 }],
          [],
        );
        expect(handler.groupIds.length).toEqual(3);
        done();
      });
    });
    it.skip('should be removed from id set because it has not unread and over limit', done => {
      jest.spyOn(groupService, 'getGroupsByType').mockResolvedValue([]);
      jest.spyOn(groupService, 'getGroupsByIds').mockResolvedValue([
        {
          id: 4,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
        },
      ]);
      jest.spyOn(profileService, 'getMaxLeftRailGroup').mockResolvedValue(2);
      const handler = setup([1, 2, 3, 4]);
      notificationCenter.emitEntityUpdate(
        ENTITY.GROUP_STATE,
        [{ id: 4, unread_count: 0 }],
        [],
      );
      jest.spyOn(handler, 'getGroupIdsByType').mockReturnValue([1, 2, 3, 4]);
      setTimeout(() => {
        expect(handler.groupIds.length).toBe(4);
        done();
      });
    });

    it.skip('should not be removed from id set because it is current group even has not unread and over limit', (done: any) => {
      (getGlobalValue as jest.Mock).mockReturnValue(4);
      const handler = setup([1, 2, 3, 4]);
      (profileService.getMaxLeftRailGroup as jest.Mock).mockResolvedValue(2);
      (groupService.getGroupsByIds as jest.Mock).mockResolvedValue([
        {
          id: 4,
          company_id: 1,
          set_abbreviation: '',
          email_friendly_abbreviation: '',
          most_recent_content_modified_at: 1,
        },
      ]);
      notificationCenter.emitEntityUpdate(
        ENTITY.GROUP_STATE,
        [{ id: 4, unread_count: 0 }],
        [],
      );
      jest.spyOn(handler, 'getGroupIdsByType').mockReturnValue([1, 2, 3, 4]);
      setTimeout(() => {
        expect(handler.groupIds.length).toBe(4);
        done();
      });
    });
  });
  describe('checkIfGroupOpenedFromHidden', () => {
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

  describe('preFetch group data()', () => {
    it('should call addProcessor twice when sectionType is favorites', async () => {
      const sectionGroupHandler = SectionGroupHandler.getInstance();
      const direction = QUERY_DIRECTION.OLDER;
      const sectionType = SECTION_TYPE.FAVORITE;
      jest
        .spyOn(sectionGroupHandler._handlersMap[sectionType], 'fetchData')
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
      await sectionGroupHandler.fetchGroups(sectionType, direction);
      expect(
        preFetchConversationDataHandler.addProcessor,
      ).toHaveBeenCalledTimes(2);
    });

    it('should call addProcessor twice when sectionType is direct_messages and state.unread_count is 2', async (done: any) => {
      const sectionGroupHandler = SectionGroupHandler.getInstance();
      const direction = QUERY_DIRECTION.OLDER;
      const sectionType = SECTION_TYPE.DIRECT_MESSAGE;
      jest
        .spyOn(sectionGroupHandler._handlersMap[sectionType], 'fetchData')
        .mockResolvedValue([{ id: 1 }, { id: 2 }]);
      jest
        .spyOn(stateService, 'getById')
        .mockResolvedValue({ unread_count: 2 });
      await sectionGroupHandler.fetchGroups(sectionType, direction);
      setTimeout(() => {
        expect(
          preFetchConversationDataHandler.addProcessor,
        ).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should call addProcessor twice when sectionType is teams and state.unread_mentions_count is 2', async (done: any) => {
      const sectionGroupHandler = SectionGroupHandler.getInstance();
      const direction = QUERY_DIRECTION.OLDER;
      const sectionType = SECTION_TYPE.TEAM;
      jest
        .spyOn(sectionGroupHandler._handlersMap[sectionType], 'fetchData')
        .mockResolvedValue([{ id: 1 }, { id: 2 }]);
      jest
        .spyOn(stateService, 'getById')
        .mockResolvedValue({ unread_mentions_count: 2 });
      await sectionGroupHandler.fetchGroups(sectionType, direction);
      setTimeout(() => {
        expect(
          preFetchConversationDataHandler.addProcessor,
        ).toHaveBeenCalledTimes(2);
        done();
      });
    });
  });
});
