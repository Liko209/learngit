/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-29 10:47:27
 * Copyright © RingCentral. All rights reserved.
 */
import { getGlobalValue } from '../../utils/entities';
import SectionGroupHandler from '../SectionGroupHandler';
import { SECTION_TYPE } from '@/containers/LeftRail/Section/types';
import {
  notificationCenter,
  ENTITY,
  ProfileService,
  GroupService,
} from 'sdk/service';
import { StateService } from 'sdk/module/state';

jest.mock('sdk/service/profile');
jest.mock('sdk/module/state');
jest.mock('sdk/service/group');
jest.mock('../../utils/entities');

const profileService = new ProfileService();
const stateService = new StateService();
const groupService = new GroupService();
(ProfileService as any).getInstance = () => profileService;
(StateService as any).getInstance = () => stateService;
(GroupService as any).getInstance = () => groupService;

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  Object.assign(SectionGroupHandler, { _instance: undefined });
  (profileService.getProfile as jest.Mock).mockResolvedValue({});
  (getGlobalValue as jest.Mock).mockReturnValue(1);
});

afterEach(() => {
  SectionGroupHandler.getInstance().dispose();
});

describe('SectionGroupHandler', () => {
  describe('Basic functions/configs', () => {
    it('getInstance', () => {
      expect(SectionGroupHandler.getInstance() !== undefined).toBeTruthy();
    });
    it('getAllGroupIds', () => {
      expect(SectionGroupHandler.getInstance().getAllGroupIds().length).toEqual(
        0,
      );
    });
    it('groupIds', () => {
      expect(
        SectionGroupHandler.getInstance().getGroupIds(SECTION_TYPE.FAVORITE),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(SECTION_TYPE.TEAM),
      ).toEqual([]);
    });
  });

  describe('Group change notification', () => {
    it('entity put', () => {
      SectionGroupHandler.getInstance();
      const fakeData = [
        {
          id: 1,
          is_team: false,
          created_at: 0,
          most_recent_post_created_at: 1,
        },
        {
          id: 2,
          is_team: true,
          created_at: 0,
          most_recent_post_created_at: 1,
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      expect(
        SectionGroupHandler.getInstance()
          .getAllGroupIds()
          .sort(),
      ).toEqual([1, 2]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(SECTION_TYPE.TEAM),
      ).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([1]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(SECTION_TYPE.FAVORITE),
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
        },
      ];
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, putData);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([2]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [3]);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance()
          .getGroupIds(SECTION_TYPE.TEAM)
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
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, putData);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(SECTION_TYPE.TEAM),
      ).toEqual([2]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [2]);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(SECTION_TYPE.TEAM),
      ).toEqual([]);
    });

    it('entity archive id not in id sets', () => {
      SectionGroupHandler.getInstance();
      const putData = [
        {
          id: 2,
          is_team: true,
          created_at: 0,
        },
      ];
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, putData);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([2]);
      notificationCenter.emitEntityArchive(ENTITY.GROUP, [
        {
          id: 3,
          is_archived: true,
        },
      ]);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance()
          .getGroupIds(SECTION_TYPE.TEAM)
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
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, putData);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(SECTION_TYPE.TEAM),
      ).toEqual([2]);
      notificationCenter.emitEntityArchive(ENTITY.GROUP, [
        {
          id: 2,
          is_archived: true,
        },
      ]);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(SECTION_TYPE.TEAM),
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
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      expect(
        SectionGroupHandler.getInstance()
          .getAllGroupIds()
          .sort(),
      ).toEqual([1]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(SECTION_TYPE.TEAM),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(SECTION_TYPE.FAVORITE),
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
        },
      ];
      notificationCenter.emitEntityUpdate(ENTITY.GROUP, fakeData);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([
        11111,
      ]);
      expect(
        SectionGroupHandler.getInstance().getGroupIds(
          SECTION_TYPE.DIRECT_MESSAGE,
        ),
      ).toEqual([11111]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [11111]);
    });
  });
  describe('getRemovedIds', async () => {
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
      jest.spyOn(sectionGroupHandler, 'getGroupIds').mockReturnValue(ids);
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
      jest.spyOn(sectionGroupHandler, 'getGroupIds').mockReturnValue(groupIds);
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
  describe('handleIncomesGroupState', async () => {
    function setup(ids: number[]) {
      const handler = SectionGroupHandler.getInstance();
      Object.assign(handler, {
        _idSet: new Set(ids),
      });
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
      expect(handler.getAllGroupIds().length).toBe(0);
    });
    it('should do nothing because not body', async () => {
      const handler = setup([1, 2]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [], []);
      expect(handler.getAllGroupIds().length).toBe(2);
    });
    it('should do nothing because this group has already in idset and not over limit', async () => {
      const handler = setup([1, 2]);
      notificationCenter.emitEntityUpdate(
        ENTITY.GROUP_STATE,
        [{ id: 1, unread_count: 1 }],
        [],
      );
      expect(handler.getAllGroupIds().length).toBe(2);
    });
    it('should do nothing because not unread count and not over limit', async () => {
      const handler = setup([1, 2]);
      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, [{ id: 1 }], []);
      expect(handler.getAllGroupIds().length).toBe(2);
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
        expect(handler.getAllGroupIds().length).toEqual(3);
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
      jest.spyOn(handler, 'getGroupIds').mockReturnValue([1, 2, 3, 4]);
      setTimeout(() => {
        expect(handler.getAllGroupIds().length).toBe(4);
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
      jest.spyOn(handler, 'getGroupIds').mockReturnValue([1, 2, 3, 4]);
      setTimeout(() => {
        expect(handler.getAllGroupIds().length).toBe(4);
        done();
      });
    });
  });
  describe('checkIfGroupOpenedFromHidden', async () => {
    it('should not change because of more hidden group ids', async () => {
      const handler = SectionGroupHandler.getInstance();
      await handler.checkIfGroupOpenedFromHidden([], [1]);
      expect(handler.getAllGroupIds().length).toBe(0);
    });
    it('should add groups because of less hidden group ids', async () => {
      const handler = SectionGroupHandler.getInstance();
      (groupService.getGroupsByIds as jest.Mock).mockResolvedValue([
        {
          id: 3,
          company_id: 1,
          is_team: false,
        },
      ]);
      await handler.checkIfGroupOpenedFromHidden([1, 2], [1]);
      expect(handler.getAllGroupIds().length).toBe(1);
    });
  });
});
