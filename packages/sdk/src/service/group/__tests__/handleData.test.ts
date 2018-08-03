/// <reference path="../../../__tests__/types.d.ts" />
import notificationCenter from '../../notificationCenter';
import { daoManager, GroupDao } from '../../../dao';
import GroupAPI from '../../../api/glip/group';
import PersonService from '../../../service/person';
import ProfileService from '../../../service/profile';
import { Group, Post, Raw, Profile } from '../../../models';
import handleData, { handleFavoriteGroupsChanged, handleGroupMostRecentPostChanged, filterGroups } from '../handleData';
import { toArrayOf } from '../../../__tests__/utils';
import StateService from '../../state';
import { GROUP_QUERY_TYPE } from '../../constants';
jest.mock('../../notificationCenter');
jest.mock('../../state');

jest.mock('../../notificationCenter');
jest.mock('../../../service/person');
jest.mock('../../../service/profile');
PersonService.getInstance = jest.fn().mockReturnValue(new PersonService());
ProfileService.getInstance = jest.fn().mockReturnValue(new ProfileService());
jest.mock('../../../dao', () => {
  const dao = {
    get: jest.fn().mockReturnValue(1),
    queryGroupsByIds: jest.fn(),
    bulkDelete: jest.fn(),
    bulkPut: jest.fn(),
  };
  return {
    daoManager: {
      getDao: () => dao,
      getKVDao: () => dao,
    },
  };
});

jest.mock('../../serviceManager', () => {
  const instance = {
    getProfile: jest.fn().mockResolvedValue({ favorite_group_ids: [1, 2] }),
    getPersonsByIds: jest.fn().mockResolvedValue({}),
  };
  return {
    getInstance: () => instance,
  };
});

jest.mock('../../../api/glip/group', () => {
  const response = {
    data: {
      id: 1,
      members: [1],
      deactivated: true,
      _delta: false,
    },
  };
  return { requestGroupById: jest.fn().mockResolvedValue(response) };
});

function generateFakeGroups(count: number, is_team: boolean) {
  const groups: Group[] = [];
  for (let i = 1; i <= count; i++) {
    groups.push({
      id: i,
      created_at: i,
      modified_at: i,
      creator_id: i,
      is_new: false,
      deactivated: false,
      version: i,
      members: [],
      company_id: i,
      set_abbreviation: '',
      email_friendly_abbreviation: '',
      most_recent_content_modified_at: i,
      most_recent_post_created_at: i,
    });
  }
  return groups;
}

describe('handleData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passing an empty array', async () => {
    const result = await handleData([]);
    expect(result).toBeUndefined();
  });

  it('passing an array', async () => {
    daoManager.getDao(GroupDao).get.mockReturnValue(1);
    const groups: Raw<Group>[] = toArrayOf<Raw<Group>>([
      { _id: 1, members: [1], deactivated: true, _delta: true },
      { _id: 2, members: [1, 2], deactivated: false },
      { _id: 3, deactivated: false },
    ]);
    await handleData(groups);
    // expect getTransformData function
    expect(GroupAPI.requestGroupById).toHaveBeenCalledTimes(1);
    // expect operateGroupDao function
    expect(daoManager.getDao(GroupDao).bulkDelete).toHaveBeenCalledTimes(1);
    expect(daoManager.getDao(GroupDao).bulkPut).toHaveBeenCalledTimes(2);
    // expect doNotification function
    expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(1);
    expect(notificationCenter.emitEntityPut).toHaveBeenCalledTimes(1);
    // expect checkIncompleteGroupsMembers function
    const personService: PersonService = PersonService.getInstance();
    expect(personService.getPersonsByIds).toHaveBeenCalled();
  });
});

describe('handleFavoriteGroupsChanged()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('params', async () => {
    daoManager.getDao(GroupDao).queryGroupsByIds.mockReturnValue([{ is_team: true }]);
    const oldProfile: any = {
      person_id: 0,
      favorite_group_ids: [1, 2],
      favorite_post_ids: 0,
    };
    const newProfile: any = {
      person_id: 0,
      favorite_group_ids: [2, 3],
      favorite_post_ids: 0,
    };
    await handleFavoriteGroupsChanged(oldProfile as Profile, newProfile as Profile);
    expect(notificationCenter.emitEntityPut).toHaveBeenCalledTimes(3);
    expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(3);
  });
  it('params are arry empty', async () => {
    daoManager.getDao(GroupDao).queryGroupsByIds.mockReturnValue([{ is_team: true }]);
    const oldProfile: any = {
      person_id: 0,
      favorite_group_ids: [1, 2],
      favorite_post_ids: 0,
    };
    const newProfile: any = {
      person_id: 0,
      favorite_group_ids: [1, 2],
      favorite_post_ids: 0,
    };
    await handleFavoriteGroupsChanged(oldProfile, newProfile);
    expect(notificationCenter.emitEntityPut).toHaveBeenCalledTimes(0);
    expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(0);
  });
});

describe('handleGroupMostRecentPostChanged()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should update group recent modified time', async () => {
    daoManager.getDao(GroupDao).get.mockReturnValue([{ is_team: true }]);
    const posts: Post[] = toArrayOf<Post>([{ id: 1, modified_at: 1, created_at: 1 }]);
    await handleGroupMostRecentPostChanged(posts);
    expect(notificationCenter.emitEntityPut).toHaveBeenCalledTimes(1);
  });
});

describe('filterGroups()', () => {
  const stateService: StateService = new StateService();
  beforeEach(() => {
    jest.clearAllMocks();
    StateService.getInstance = jest.fn().mockReturnValue(stateService);
  });
  it('items with states without ids', async () => {
    const teams = generateFakeGroups(5, true);
    const result = await filterGroups(teams, GROUP_QUERY_TYPE.TEAM, 2);
    expect(result.length).toBe(2);
  });
  it('items is less then limit', async () => {
    const teams = generateFakeGroups(5, true);
    const result = await filterGroups(teams, GROUP_QUERY_TYPE.TEAM, 20);
    expect(result.length).toBe(5);
  });
  it('items with states id', async () => {
    stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([
      {
        id: 2,
        unread_count: 1,
      },
    ]);
    const teams = generateFakeGroups(5, true);
    let result = await filterGroups(teams, GROUP_QUERY_TYPE.TEAM, 2);
    expect(result.length).toBe(4);

    result = await filterGroups(teams, GROUP_QUERY_TYPE.TEAM, 5);
    expect(result.length).toBe(5);
  });
  it('items with states ids', async () => {
    stateService.getAllGroupStatesFromLocal.mockResolvedValue([
      {
        id: 4,
        unread_count: 1,
      },
      {
        id: 3,
        unread_count: 1,
      },
    ]);
    const teams = generateFakeGroups(5, true);
    let result = await filterGroups(teams, GROUP_QUERY_TYPE.TEAM, 2);
    expect(result.length).toBe(3);

    result = await filterGroups(teams, GROUP_QUERY_TYPE.TEAM, 1);
    expect(result.length).toBe(3);
  });
});
