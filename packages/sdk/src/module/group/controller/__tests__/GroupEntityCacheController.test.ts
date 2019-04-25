/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-17 14:17:10
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupEntityCacheController } from '../GroupEntityCacheController';
import { AccountUserConfig } from '../../../../module/account/config';
import { Group } from '../../entity';
import { GroupService } from '../../service/GroupService';
const soundex = require('soundex-code');

jest.mock('../../../../module/account/config');
jest.mock('../../../../api');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}
const testTeamData = [
  {
    id: 2,
    is_team: false,
    members: [1, 2],
  },
  {
    id: 3,
    is_team: true,
    set_abbreviation: 'This is a team',
    members: [1, 2, 3],
  },
];

const soundexResult = [
  soundex('this'),
  soundex('is'),
  soundex('a'),
  soundex('team'),
];
describe('GroupEntityCacheController', () => {
  let groupEntityCacheController: GroupEntityCacheController;
  function setUp() {
    const groupService: any = new GroupService();
    groupEntityCacheController = new GroupEntityCacheController(groupService);
    AccountUserConfig.prototype.getGlipUserId = jest.fn().mockReturnValue(1);
  }

  function prepareForGroupData() {
    groupEntityCacheController.initialize(testTeamData as Group[]);
  }
  beforeEach(() => {
    clearMocks();
  });

  describe('buildGroupEntityCacheController', () => {
    it('should return GroupEntityCacheController', () => {
      const groupService: any = new GroupService();
      expect(
        GroupEntityCacheController.buildGroupEntityCacheController(
          groupService,
        ),
      ).toBeInstanceOf(GroupEntityCacheController);
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('initial state should be false before init', () => {
      expect(groupEntityCacheController.isInitialized()).toBeFalsy();
    });

    it('initial state should be true after init ', () => {
      groupEntityCacheController.initialize([]);
      expect(groupEntityCacheController.isInitialized()).toBeTruthy();
    });

    it('should set individual groups to individual cache when init', () => {
      prepareForGroupData();
      expect(groupEntityCacheController.getIndividualGroups()).toEqual(
        new Map([[2, testTeamData[0]]]),
      );
    });

    it('should set soundexValue when init', () => {
      prepareForGroupData();
      expect(groupEntityCacheController.getSoundexById(3)).toEqual(
        soundexResult,
      );
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      prepareForGroupData();
    });

    it('should clear all data after clear', async () => {
      expect(await groupEntityCacheController.getEntities()).not.toEqual([]);
      expect(groupEntityCacheController.getIndividualGroups()).not.toEqual(
        new Map(),
      );

      await groupEntityCacheController.clear();

      expect(await groupEntityCacheController.getEntities()).toEqual([]);
      expect(groupEntityCacheController.getIndividualGroups()).toEqual(
        new Map(),
      );
      expect(groupEntityCacheController.getSoundexById(3)).toEqual([]);
    });
  });

  describe('getIndividualGroups', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      prepareForGroupData();
    });

    it('should return individual groups as expected', () => {
      expect(groupEntityCacheController.getIndividualGroups()).toEqual(
        new Map([[2, testTeamData[0]]]),
      );
    });
  });
  describe('getSoundexById', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      prepareForGroupData();
    });

    it('should soundex value as expected when group is a team', () => {
      expect(groupEntityCacheController.getSoundexById(3)).toEqual(
        soundexResult,
      );
    });

    it('should empty array as expected when group is a not team', () => {
      expect(groupEntityCacheController.getSoundexById(2)).toEqual([]);
    });
  });
  describe('updateEx', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    const entities = new Map([[2, testTeamData[0] as Group]]);

    it('should add to cache when is new group', () => {
      groupEntityCacheController.updateEx(entities);
      expect(groupEntityCacheController.getIndividualGroups()).toEqual(
        new Map([[2, testTeamData[0]]]),
      );
    });
  });

  describe('CRUD group', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('update, should add to cache when update a not exist group', () => {
      groupEntityCacheController.update(testTeamData[0]);

      const res = groupEntityCacheController.getIndividualGroups();
      expect(res).toEqual(new Map([[2, testTeamData[0]]]));
    });

    it('update multi groups, should add to cache when update a not exist group', () => {
      groupEntityCacheController.update([
        testTeamData[0],
        {
          id: 3,
          is_team: true,
          members: [1, 3],
        },
      ]);

      const res = groupEntityCacheController.getIndividualGroups();
      expect(res).toEqual(new Map([[2, testTeamData[0]]]));
    });

    it('update, should not add to cache when update a not exist group but not a individual group', () => {
      groupEntityCacheController.update([
        {
          id: 2,
          is_team: false,
          members: [1, 2, 3],
        },
        testTeamData[1],
      ]);

      const res = groupEntityCacheController.getIndividualGroups();
      expect(res).toEqual(new Map());
    });

    it('should add to cache when put a individual group', () => {
      groupEntityCacheController.put([
        testTeamData[0],
        {
          id: 3,
          is_team: true,
          members: [1, 3],
        },
      ] as Group[]);

      const res = groupEntityCacheController.getIndividualGroups();
      expect(res).toEqual(new Map([[2, testTeamData[0]]]));
    });

    it('should not add to cache when put a multiple people group or team', () => {
      groupEntityCacheController.put([
        {
          id: 2,
          is_team: false,
          members: [1, 2, 3],
        },
        testTeamData[1],
      ] as Group[]);

      const res = groupEntityCacheController.getIndividualGroups();
      expect(res).toEqual(new Map());
    });

    it('delete, should delete the corresponding individual group as well', () => {
      groupEntityCacheController.put([
        {
          id: 2,
          is_team: false,
          members: [1, 4],
        },
        {
          id: 3,
          is_team: true,
          members: [1, 2, 3],
        },
      ] as Group[]);

      const res = groupEntityCacheController.getIndividualGroups();
      expect(res).toEqual(
        new Map([
          [
            4,
            {
              id: 2,
              is_team: false,
              members: [1, 4],
            },
          ],
        ]),
      );
      groupEntityCacheController.delete(2);
      const finalRes = groupEntityCacheController.getIndividualGroups();
      expect(finalRes).toEqual(new Map());
    });
  });
});
