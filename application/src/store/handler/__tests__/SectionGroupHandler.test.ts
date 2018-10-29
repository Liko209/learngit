/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-29 10:47:27
 * Copyright © RingCentral. All rights reserved.
 */

import SectionGroupHandler from '../SectionGroupHandler';
import { SECTION_TYPE } from '@/containers/LeftRail/Section/types';
import { notificationCenter, ENTITY } from 'sdk/service';
import EnvSelect from '@/containers/UnifiedLogin/EnvSelect';

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
      notificationCenter.emitEntityPut(ENTITY.GROUP, fakeData);
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
      notificationCenter.emitEntityDelete(ENTITY.GROUP, fakeData);
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
      const deleteData = [
        {
          id: 3,
          is_team: true,
          created_at: 0,
        },
      ];
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([]);
      notificationCenter.emitEntityPut(ENTITY.GROUP, putData);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([2]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, deleteData);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance()
          .groupIds(SECTION_TYPE.TEAM)
          .sort(),
      ).toEqual([2]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, putData);
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
      notificationCenter.emitEntityPut(ENTITY.GROUP, putData);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([2]);
      expect(
        SectionGroupHandler.getInstance().groupIds(SECTION_TYPE.TEAM),
      ).toEqual([2]);
      notificationCenter.emitEntityDelete(ENTITY.GROUP, putData);
      expect(SectionGroupHandler.getInstance().getAllGroupIds()).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().groupIds(SECTION_TYPE.DIRECT_MESSAGE),
      ).toEqual([]);
      expect(
        SectionGroupHandler.getInstance().groupIds(SECTION_TYPE.TEAM),
      ).toEqual([]);
    });
  });
});
