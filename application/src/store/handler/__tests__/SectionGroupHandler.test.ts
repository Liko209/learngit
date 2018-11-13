/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-29 10:47:27
 * Copyright © RingCentral. All rights reserved.
 */

import SectionGroupHandler from '../SectionGroupHandler';
import { SECTION_TYPE } from '@/containers/LeftRail/Section/types';
import { notificationCenter, ENTITY } from 'sdk/service';

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
        SectionGroupHandler.getInstance().groupIds(SECTION_TYPE.FAVORITE),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().groupIds(SECTION_TYPE.DIRECT_MESSAGE),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().groupIds(SECTION_TYPE.TEAM),
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
        SectionGroupHandler.getInstance().groupIds(SECTION_TYPE.TEAM),
      ).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance().groupIds(SECTION_TYPE.DIRECT_MESSAGE),
      ).toEqual([1]);
      expect(
        SectionGroupHandler.getInstance().groupIds(SECTION_TYPE.FAVORITE),
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
          .groupIds(SECTION_TYPE.TEAM)
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
        SectionGroupHandler.getInstance().groupIds(SECTION_TYPE.TEAM),
      ).toEqual([2]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, [2]);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().groupIds(SECTION_TYPE.DIRECT_MESSAGE),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().groupIds(SECTION_TYPE.TEAM),
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

  describe('removeOverflewGroupByChangingIds', () => {});
  describe('removeOverflewGroupByChangingCurrentGroupId', () => {});
});
