/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-23 23:21:11
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupService, PersonService } from 'sdk/service';
import SortableGroupMemberHandler from '../SortableGroupMemberHandler';
jest.mock('sdk/service/group');
jest.mock('sdk/service/person');

describe('SortableGroupMemberHandler', async () => {
  const groupService = new GroupService();
  const personService = new PersonService();
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    PersonService.getInstance = jest.fn().mockReturnValue(personService);
    GroupService.getInstance = jest.fn().mockReturnValue(groupService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should return SortableGroupMemberHandler', async () => {
    const groupId = 3;
    const group = { id: groupId };
    const persons = [
      { id: 1, email: 'c@c.com' },
      { id: 2, email: 'b@c.com' },
      { id: 3, email: 'a@a.com' },
    ];
    groupService.getGroupById.mockResolvedValue(group);
    personService.getPersonsByGroupId.mockResolvedValue(persons);
    const res = await SortableGroupMemberHandler.createSortableGroupMemberHandler(
      groupId,
    );
    expect(res).not.toBeNull();
    expect(res).toBeInstanceOf(SortableGroupMemberHandler);
    expect(res.getSortedGroupMembersIds()).toEqual([]);
    expect(personService.getPersonsByGroupId).toBeCalledWith(groupId);
  });
});
