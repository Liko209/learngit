/// <reference path="../../../__tests__/types.d.ts" />
import notificationCenter from '../../notificationCenter';
import { daoManager, GroupDao } from '../../../dao';
import GroupAPI from '../../../api/glip/group';
import PersonService from '../../../service/person';
import ProfileService from '../../../service/profile';
import AccountService from '../../../service/account';
import { Group, Post, Raw, Profile } from '../../../models';
import handleData, {
  handleFavoriteGroupsChanged,
  handleGroupMostRecentPostChanged,
  filterGroups,
  handlePartialData,
  isNeedToUpdateMostRecent4Group,
  getUniqMostRecentPostsByGroup,
  handleHiddenGroupsChanged,
} from '../handleData';
import { toArrayOf } from '../../../__tests__/utils';
import StateService from '../../state';
import { DEFAULT_CONVERSATION_LIST_LIMITS } from '../../account/constants';
import { transform } from '../../utils';
import { EVENT_TYPES } from '../..';

jest.mock('../../../service/person');
jest.mock('../../../service/profile');
jest.mock('../../../service/account');
jest.mock('../../notificationCenter');
jest.mock('../../state');
jest.mock('../../notificationCenter');
jest.mock('../../../dao', () => {
  const dao = {
    get: jest.fn().mockReturnValue(1),
    queryGroupsByIds: jest.fn(),
    bulkDelete: jest.fn(),
    bulkPut: jest.fn(),
    doInTransaction: jest.fn(),
    update: jest.fn(),
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

type GenerateFakeGroupOptions = {
  hasPost: boolean;
};

function generateFakeGroups(count: number, { hasPost = true } = {}) {
  const groups: Group[] = [];

  for (let i = 1; i <= count; i += 1) {
    const group: Group = {
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
    };

    if (hasPost) {
      group.most_recent_post_created_at = i;
    }
    groups.push(group);
  }
  return groups;
}

const stateService: StateService = new StateService();
const accountService = new AccountService();
const personService = new PersonService();
const profileService = new ProfileService();

beforeEach(() => {
  jest.clearAllMocks();
  StateService.getInstance = jest.fn().mockReturnValue(stateService);
  AccountService.getInstance = jest.fn().mockReturnValue(accountService);
  PersonService.getInstance = jest.fn().mockReturnValue(personService);
  ProfileService.getInstance = jest.fn().mockReturnValue(profileService);
});

describe('handleData()', () => {
  it('passing an empty array', async () => {
    const result = await handleData([]);
    expect(result).toBeUndefined();
  });

  it('passing an array', async () => {
    expect.assertions(6);
    daoManager.getDao(GroupDao).get.mockReturnValue(1);
    const groups: Raw<Group>[] = toArrayOf<Raw<Group>>([
      {
        _id: 1,
        members: [1],
        deactivated: true,
        _delta: {
          remove: { members: Array(1) },
          set: {
            modified_at: 1535007198836,
            most_recent_content_modified_at: 1535007198836,
            version: 2916578790211584,
          },
          _id: 4276230,
        },
      },
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
    expect(notificationCenter.emit).toHaveBeenCalledTimes(1);
    expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(1);
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(1);
    // expect checkIncompleteGroupsMembers function
    // const personService: PersonService = PersonService.getInstance();
    // expect(personService.getPersonsByIds).toHaveBeenCalled();
  });
});

describe('handlePartialData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save directly if find partial in DB', async () => {
    daoManager.getDao(GroupDao).get.mockReturnValueOnce(1);
    const groups: Partial<Raw<Group>>[] = toArrayOf<Partial<Raw<Group>>>([
      {
        _id: 3375110,
        version: 2484043918606336,
        modified_at: 1535014387734,
        post_cursor: 26,
      },
    ]);
    await handlePartialData(groups);
    expect(daoManager.getDao(GroupDao).update).toHaveBeenCalledTimes(1);
    expect(notificationCenter.emit).toHaveBeenCalledTimes(1);

    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(1);
    expect(GroupAPI.requestGroupById).not.toHaveBeenCalled();
  });

  it('should call api if can not find partial in DB', async () => {
    daoManager.getDao(GroupDao).get.mockReturnValueOnce(null);
    const groups: Partial<Raw<Group>>[] = toArrayOf<Partial<Raw<Group>>>([
      {
        _id: 3375110,
        version: 2484043918606336,
        modified_at: 1535014387734,
        post_cursor: 26,
      },
    ]);
    await handlePartialData(groups);
    expect(daoManager.getDao(GroupDao).update).toHaveBeenCalledTimes(0);
    expect(GroupAPI.requestGroupById).toHaveBeenCalledTimes(1);
  });
});
describe('handleFavoriteGroupsChanged()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('params', async () => {
    daoManager
      .getDao(GroupDao)
      .queryGroupsByIds.mockResolvedValue([{ id: 1, is_team: true }]);
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
    await handleFavoriteGroupsChanged(
      oldProfile as Profile,
      newProfile as Profile,
    );
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(2);
    expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(2);
    expect(notificationCenter.emitEntityReplace).toHaveBeenCalledTimes(1);
    jest.clearAllMocks();
  });
  it('params are arry empty', async () => {
    daoManager
      .getDao(GroupDao)
      .queryGroupsByIds.mockResolvedValueOnce([{ is_team: true }]);
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
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(0);
    expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(0);
  });
});

describe('handleGroupMostRecentPostChanged()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const post = {
    id: 1,
    modified_at: 100,
    created_at: 100,
    is_team: true,
    group_id: 2,
  };
  const map = new Map();
  map.set(1, post);
  it('EVENT_TYPES is not PUT, do not update', async () => {
    await handleGroupMostRecentPostChanged({
      type: EVENT_TYPES.UPDATE,
      entities: map,
    });
    expect(notificationCenter.emit).toHaveBeenCalledTimes(0);
  });
  it('EVENT_TYPES is PUT, do update', async () => {
    daoManager
      .getDao(GroupDao)
      .doInTransaction.mockImplementation(async (fn: Function) => {
        await fn();
      });
    daoManager.getDao(GroupDao).get.mockResolvedValueOnce({
      id: 2,
      most_recent_post_created_at: 99,
    });
    await handleGroupMostRecentPostChanged({
      type: EVENT_TYPES.UPDATE,
      entities: map,
    });
    expect(notificationCenter.emit).toHaveBeenCalledTimes(2);
  });
  it('group has not most_recent_post_created_at should update group recent modified time', async () => {
    daoManager
      .getDao(GroupDao)
      .doInTransaction.mockImplementation(async (fn: Function) => {
        await fn();
      });
    daoManager.getDao(GroupDao).get.mockResolvedValueOnce({
      id: 2,
    });
    await handleGroupMostRecentPostChanged({
      type: EVENT_TYPES.UPDATE,
      entities: map,
    });
    expect(notificationCenter.emit).toHaveBeenCalledTimes(2);
  });

  it('group has most_recent_post_created_at and greater then post created_at should not update group recent modified time', async () => {
    daoManager
      .getDao(GroupDao)
      .doInTransaction.mockImplementation(async (fn: Function) => {
        await fn();
      });
    daoManager.getDao(GroupDao).get.mockResolvedValueOnce({
      id: 2,
      most_recent_post_created_at: 101,
    });
    await handleGroupMostRecentPostChanged({
      type: EVENT_TYPES.UPDATE,
      entities: map,
    });
    expect(notificationCenter.emit).toHaveBeenCalledTimes(2);
  });
});

describe('filterGroups()', () => {
  it('should remove extra, when limit < total groups', async () => {
    const LIMIT = 2;
    const TOTAL_GROUPS = 5;

    const groups = generateFakeGroups(TOTAL_GROUPS);

    const filteredGroups = await filterGroups(groups, LIMIT);
    expect(filteredGroups.length).toBe(LIMIT);
  });

  it('should return all groups, when limit = total groups', async () => {
    const LIMIT = 5;
    const TOTAL_GROUPS = 5;

    const teams = generateFakeGroups(TOTAL_GROUPS);

    const filteredGroups = await filterGroups(teams, LIMIT);
    expect(filteredGroups.length).toBe(TOTAL_GROUPS);
  });

  it('should return all groups, when limit > total groups', async () => {
    const LIMIT = 10;
    const TOTAL_GROUPS = 5;

    const teams = generateFakeGroups(TOTAL_GROUPS);

    const filteredGroups = await filterGroups(teams, LIMIT);
    expect(filteredGroups.length).toBe(TOTAL_GROUPS);
  });

  it("should return groups with unread group which unread group's position > limit", async () => {
    const LIMIT = 2;
    const TOTAL_GROUPS = 5;

    const teams = generateFakeGroups(TOTAL_GROUPS);

    stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([
      { id: 2, unread_count: 1 },
    ]);

    const filteredGroups = await filterGroups(teams, LIMIT);
    expect(filteredGroups.length).toBe(3);
  });

  it("should return all groups when unread group's position = limit", async () => {
    const LIMIT = 4;
    const TOTAL_GROUPS = 5;

    const teams = generateFakeGroups(TOTAL_GROUPS);
    stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([
      { id: 2, unread_count: 1 },
    ]);

    const filteredGroups = await filterGroups(teams, LIMIT);
    expect(filteredGroups.length).toBe(LIMIT);
  });

  it("should return all groups when unread group's position < limit", async () => {
    const LIMIT = 5;
    const TOTAL_GROUPS = 5;

    const teams = generateFakeGroups(TOTAL_GROUPS);
    stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([
      { id: 2, unread_count: 1 },
    ]);

    const filteredGroups = await filterGroups(teams, LIMIT);
    expect(filteredGroups.length).toBe(LIMIT);
  });

  it('should return groups with unread @mention', async () => {
    const LIMIT = 2;
    const TOTAL_GROUPS = 5;

    const teams = generateFakeGroups(TOTAL_GROUPS);
    stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([
      { id: 2, unread_mentions_count: 1 },
      { id: 3, unread_mentions_count: 1 },
    ]);

    const filteredGroups = await filterGroups(teams, LIMIT);
    expect(filteredGroups.length).toBe(4);
  });

  it('should return groups until oldest unread, when multiple groups have unread', async () => {
    const LIMIT = 2;
    const TOTAL_GROUPS = 5;

    const teams = generateFakeGroups(TOTAL_GROUPS);
    stateService.getAllGroupStatesFromLocal.mockResolvedValue([
      { id: 4, unread_count: 1 },
      { id: 3, unread_count: 1 },
    ]);

    const filteredGroups = await filterGroups(teams, LIMIT);
    expect(filteredGroups.length).toBe(3);
  });

  it('should also return groups that have not post', async () => {
    const LIMIT = 2;
    const TOTAL_GROUPS = 5;

    const teams = generateFakeGroups(TOTAL_GROUPS, { hasPost: false });
    stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([]);

    const filteredGroups = await filterGroups(teams, LIMIT);
    expect(filteredGroups.length).toBe(LIMIT);
  });
});

describe('isNeedToUpdateMostRecent4Group', () => {
  it('should to update most recent post for a group', () => {
    const posts: Post[] = toArrayOf<Post>([
      { id: 1, group_id: 1, modified_at: 100, created_at: 100 },
    ]);
    const groups: Group[] = toArrayOf<Group>([
      { id: 1, most_recent_post_created_at: 99 },
      { id: 1, most_recent_post_created_at: 100 },
    ]);
    expect(isNeedToUpdateMostRecent4Group(posts[0], groups[0])).toBeTruthy();
    expect(isNeedToUpdateMostRecent4Group(posts[0], groups[1])).toBeFalsy();
  });
});

describe('getUniqMostRecentPostsByGroup', () => {
  it('should have 2 posts', () => {
    const posts: Post[] = toArrayOf<Post>([
      { id: 1, group_id: 1, modified_at: 1, created_at: 100 },
      { id: 2, group_id: 1, modified_at: 1, created_at: 101 },

      { id: 3, group_id: 2, modified_at: 1, created_at: 101 },
    ]);

    const groupedPosts = getUniqMostRecentPostsByGroup(posts);
    expect(groupedPosts.length).toEqual(2);
    expect(groupedPosts[0].id).toEqual(2);
    expect(groupedPosts[1].id).toEqual(3);
  });
});

describe('handleHiddenGroupsChanged', () => {
  it('handleHiddenGroupsChanged, more hidden', async () => {
    daoManager
      .getDao(GroupDao)
      .queryGroupsByIds.mockReturnValueOnce([
        { id: 1, is_team: true },
        { id: 2, is_team: false },
      ]);
    await handleHiddenGroupsChanged([], [1, 2]);
    expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(1);
  });
  it('handleHiddenGroupsChanged, less hidden', async () => {
    await handleHiddenGroupsChanged([1, 2], []);
    expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(0);
  });
});
