/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-23 23:21:11
 * Copyright © RingCentral. All rights reserved.
 */

import { notificationCenter, ENTITY } from 'sdk/service';

import { PersonService } from 'sdk/module/person';

import { TeamPermission, GroupService } from 'sdk/module/group';
import SortableGroupMemberHandler from '../SortableGroupMemberHandler';
import { Person } from 'sdk/module/person/entity';

jest.mock('sdk/module/group');
jest.mock('sdk/module/person');

describe('SortableGroupMemberHandler', () => {
  const groupService = new GroupService();
  const personService = new PersonService();
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetModules();

    PersonService.getInstance = jest.fn().mockReturnValue(personService);
    GroupService.getInstance = jest.fn().mockReturnValue(groupService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should return SortableGroupMemberHandler', async () => {
    const groupId = 3;
    const group = { id: groupId, members: [1, 2, 3] };
    const persons = [
      { id: 1, email: 'c@c.com' },
      { id: 2, email: 'b@c.com' },
      { id: 3, email: 'a@a.com' },
    ];
    groupService.getById.mockResolvedValueOnce(group);
    personService.getPersonsByIds.mockResolvedValueOnce(persons);
    const handler = await SortableGroupMemberHandler.createSortableGroupMemberHandler(
      groupId,
    );
    setTimeout(() => {
      expect(handler).not.toBeNull();
      expect(handler).toBeInstanceOf(SortableGroupMemberHandler);
      expect(handler.getSortedGroupMembersIds()).toEqual([
        persons[0].id,
        persons[1].id,
        persons[2].id,
      ]);
      expect(personService.getPersonsByIds).resolves.toBeCalledWith([1, 2, 3]);
    });
  });

  it('should return sorted member list, admin first, then members', async () => {
    const groupId = 3;
    const group = {
      id: groupId,
      is_team: true,
      members: [1, 2, 3, 4, 5, 6, 7],
    };
    const persons = [
      { id: 1, email: 'c@a.com' },
      { id: 2, email: 'b@a.com' },
      { id: 3, email: 'a@a.com' },
      { id: 4, email: 'j@a.com' },
      { id: 5, email: 'f@a.com' },
      { id: 6, email: 'e@a.com' },
      { id: 7, email: 'd@a.com' },
    ];

    const expectRes = [3, 2, 1, 7, 6, 5, 4];

    groupService.getById.mockResolvedValueOnce(group);
    personService.getPersonsByIds.mockResolvedValueOnce(persons);

    groupService.isTeamAdmin.mockImplementation(
      (personId: number, permission?: TeamPermission) => {
        return personId < 4;
      },
    ); // first 3 is admin;

    personService.getFullName.mockImplementation((person: Person) => {
      return person.email;
    });

    const handler = await SortableGroupMemberHandler.createSortableGroupMemberHandler(
      groupId,
    );
    setTimeout(() => {
      expect(handler.getSortedGroupMembersIds()).toEqual(expectRes);
      expect(personService.getPersonsByIds).resolves.toBeCalledWith([
        1,
        2,
        3,
        4,
        5,
        6,
        7,
      ]);
    });
  });

  it('should call replace ids when group members changed', async (done: jest.DoneCallback) => {
    const groupId = 3;
    const group = {
      id: groupId,
      members: [2, 3],
    };
    const persons = [{ id: 2, email: 'b@a.com' }, { id: 3, email: 'a@a.com' }];

    groupService.getById.mockResolvedValueOnce(group);
    personService.getPersonsByIds.mockResolvedValueOnce(persons);

    const groupUpdates = [
      { id: groupId, members: [1] },
      { id: groupId + 1, members: [2, 3] },
    ];
    const handler = await SortableGroupMemberHandler.createSortableGroupMemberHandler(
      groupId,
    );

    expect(handler).not.toBeNull;
    if (handler) {
      const spy = jest.spyOn<SortableGroupMemberHandler, any>(
        handler,
        '_handleGroupUpdate',
      );
      const spyReplaceAll = jest.spyOn<SortableGroupMemberHandler, any>(
        handler,
        '_replaceData',
      );
      spyReplaceAll.mockImplementationOnce(() => {});
      setTimeout(() => {
        notificationCenter.emitEntityUpdate(ENTITY.GROUP, groupUpdates);
        expect(spy).toBeCalledWith(groupUpdates[0]);
        expect(spyReplaceAll).toBeCalledTimes(1);
        done();
      });
    }
  });
});
