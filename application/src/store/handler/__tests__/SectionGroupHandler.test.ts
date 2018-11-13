/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-29 10:47:27
 * Copyright © RingCentral. All rights reserved.
 */
import SectionGroupHandler from '../SectionGroupHandler';
import { SECTION_TYPE } from '@/containers/LeftRail/Section/types';
import {
  notificationCenter,
  ENTITY,
  ProfileService,
  StateService,
} from 'sdk/service';

const profileService = new ProfileService();
const stateService = new StateService();
(ProfileService as any).getInstance = () => profileService;
(StateService as any).getInstance = () => stateService;
jest.mock('sdk/service/profile');
jest.mock('sdk/service/state');

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  (profileService.getProfile as jest.Mock).mockResolvedValue({});
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
        },
        {
          id: 2,
          is_team: true,
          created_at: 0,
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
});
