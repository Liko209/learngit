/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-23 23:21:11
 * Copyright © RingCentral. All rights reserved.
 */

import { notificationCenter } from 'sdk/service';
import { PersonService } from 'sdk/module/person';
import { GroupService } from 'sdk/module/group';
import SortableGroupMemberHandler from '../SortableGroupMemberHandler';
import { Person } from 'sdk/module/person/entity';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('sdk/service');
jest.mock('sdk/module/group');
jest.mock('sdk/module/person');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('SortableGroupMemberHandler', () => {
  let groupService: GroupService;
  let personService: PersonService;
  let sortableGroupMemberHandler: SortableGroupMemberHandler;
  const groupId = 100;
  function setUp() {
    sortableGroupMemberHandler = new SortableGroupMemberHandler(groupId);
    groupService = new GroupService();
    personService = new PersonService();

    const serviceMap: Map<string, any> = new Map([
      [ServiceConfig.GROUP_SERVICE, groupService as any],
      [ServiceConfig.PERSON_SERVICE, personService as any],
    ]);

    ServiceLoader.getInstance = jest.fn().mockImplementation((name: string) => {
      return serviceMap.get(name);
    });
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('handle group update', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should not handle when has no group in payload', () => {
      const groupChangePayload = {
        type: 'update',
        body: { entities: new Map() },
      };

      notificationCenter.on = jest
        .fn()
        .mockImplementation((key: string, handleFunc: any) => {
          handleFunc(groupChangePayload);
        });

      sortableGroupMemberHandler['_handleGroupUpdate'] = jest.fn();
      sortableGroupMemberHandler['_subscribeGroupChange']();

      expect(
        sortableGroupMemberHandler['_handleGroupUpdate'],
      ).not.toHaveBeenCalled();
    });

    it('should not handle when is not initialized', () => {
      const groupChangePayload = {
        type: 'update',
        body: {
          entities: new Map([
            [groupId, { id: groupId, members: [1, 2, 3, 5, 6] }],
          ]),
        },
      };

      notificationCenter.on = jest
        .fn()
        .mockImplementation((key: string, handleFunc: any) => {
          handleFunc(groupChangePayload);
        });

      sortableGroupMemberHandler['_initGroupData'] = jest.fn();
      sortableGroupMemberHandler['_foc'] = undefined as any;
      sortableGroupMemberHandler['_subscribeGroupChange']();
      expect(
        sortableGroupMemberHandler['_initGroupData'],
      ).not.toHaveBeenCalled();
    });

    it('should update member list when member is changed', () => {
      const groupChangePayload = {
        type: 'update',
        body: {
          entities: new Map([
            [groupId, { id: groupId, members: [1, 2, 3, 5] }],
          ]),
        },
      };

      notificationCenter.on = jest
        .fn()
        .mockImplementation((key: string, handleFunc: any) => {
          handleFunc(groupChangePayload);
        });

      sortableGroupMemberHandler['_group'] = {
        id: groupId,
        members: [1, 2, 3],
      } as any;
      sortableGroupMemberHandler['_foc'] = {} as any;
      sortableGroupMemberHandler[
        '_initGroupData'
      ] = jest.fn().mockResolvedValue({});

      sortableGroupMemberHandler['_groupMemberDataProvider'] = {
        onSourceIdsChanged: jest.fn(),
      } as any;
      sortableGroupMemberHandler['_subscribeGroupChange']();

      expect(sortableGroupMemberHandler['_initGroupData']).toHaveBeenCalled();
    });

    it('should update member list admin changed', () => {
      const groupChangePayload = {
        type: 'update',
        body: {
          entities: new Map([
            [
              groupId,
              {
                id: groupId,
                members: [1, 2, 5, 3],
                is_team: true,
                permissions: { admin: { uids: [1, 2, 3] } },
              },
            ],
          ]),
        },
      };

      sortableGroupMemberHandler['_adminIds'] = new Set([1, 2]);
      sortableGroupMemberHandler['_group'] = {
        id: groupId,
        members: [1, 2, 3, 5],
        is_team: true,
        permissions: { admin: { uids: [1, 2] } },
      } as any;

      notificationCenter.on = jest
        .fn()
        .mockImplementation((key: string, handleFunc: any) => {
          handleFunc(groupChangePayload);
        });

      sortableGroupMemberHandler['_foc'] = {} as any;
      sortableGroupMemberHandler[
        '_initGroupData'
      ] = jest.fn().mockResolvedValue({});

      sortableGroupMemberHandler['_groupMemberDataProvider'] = {
        onSourceIdsChanged: jest.fn(),
      } as any;
      sortableGroupMemberHandler['_subscribeGroupChange']();

      expect(sortableGroupMemberHandler['_initGroupData']).toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should off notification when call dispose', () => {
      sortableGroupMemberHandler['_isFetchBegin'] = true;
      const foc = { dispose: jest.fn() };
      sortableGroupMemberHandler['_foc'] = foc as any;
      sortableGroupMemberHandler.dispose();
      expect(foc.dispose).toHaveBeenCalled();
      expect(sortableGroupMemberHandler['_isFetchBegin']).toBeFalsy();
    });
  });

  describe('allSortedMembers', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return all sortedMembers', () => {
      sortableGroupMemberHandler['_sortedGroupMemberIds'] = [123, 345];
      expect(sortableGroupMemberHandler.allSortedMemberIds).toEqual([123, 345]);
    });

    it('should return empty array when has no member ids', () => {
      sortableGroupMemberHandler['_sortedGroupMemberIds'] = undefined as any;
      expect(sortableGroupMemberHandler.allSortedMemberIds).toEqual([]);
    });
  });
  describe('sort group members', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('team should set admin first and then order by alphabet', async (done: any) => {
      const groupId = 3;
      const group = {
        id: groupId,
        is_team: true,
        members: [1, 2, 3, 4, 5, 6, 7],
        permissions: { admin: { uids: [4, 5] } },
      };
      const persons = [
        { id: 4, email: 'j@a.com' },
        { id: 5, email: 'f@a.com' },
        { id: 6, email: 'e@a.com' },
        { id: 7, email: 'd@a.com' },
        { id: 2, email: 'b@a.com' },
        { id: 1, email: 'c@a.com' },
        { id: 3, email: 'a@a.com' },
      ];

      const expectRes = [5, 4, 3, 2, 1, 7, 6];

      groupService.getById = jest.fn().mockResolvedValue(group);
      personService.getPersonsByIds = jest.fn().mockResolvedValue(persons);
      personService.getFullName = jest
        .fn()
        .mockImplementation((person: Person) => {
          return person.email;
        });

      expect(sortableGroupMemberHandler['_isFetchBegin']).toBeFalsy();
      await sortableGroupMemberHandler.fetchGroupMembersByPage(20);
      expect(sortableGroupMemberHandler['_isFetchBegin']).toBeTruthy();
      setTimeout(() => {
        expect(sortableGroupMemberHandler.sortedMemberIds).toEqual(expectRes);
        expect(personService.getPersonsByIds).toHaveBeenCalledWith([
          1,
          2,
          3,
          4,
          5,
          6,
          7,
        ]);
        done();
      });
    });

    it('team should order by alphabet for normal group', async (done: any) => {
      const groupId = 3;
      const group = {
        id: groupId,
        members: [1, 2, 3, 4, 5, 6, 7],
      };
      const persons = [
        { id: 4, email: 'j@a.com' },
        { id: 5, email: 'f@a.com' },
        { id: 6, email: 'e@a.com' },
        { id: 7, email: 'd@a.com' },
        { id: 2, email: 'b@a.com' },
        { id: 1, email: 'c@a.com' },
        { id: 3, email: 'a@a.com' },
      ];

      const expectRes = [3, 2, 1, 7, 6, 5, 4];

      groupService.getById = jest.fn().mockResolvedValue(group);
      personService.getPersonsByIds = jest.fn().mockResolvedValue(persons);
      personService.getFullName = jest
        .fn()
        .mockImplementation((person: Person) => {
          return person.email;
        });

      sortableGroupMemberHandler.fetchGroupMembersByPage(20);

      setTimeout(() => {
        expect(sortableGroupMemberHandler.sortedMemberIds).toEqual(expectRes);
        expect(personService.getPersonsByIds).toHaveBeenCalledWith([
          1,
          2,
          3,
          4,
          5,
          6,
          7,
        ]);

        done();
      });
    });
  });
});
