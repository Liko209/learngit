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
  filterGroups, handlePartialData,
} from '../handleData';
import { toArrayOf } from '../../../__tests__/utils';
import StateService from '../../state';
import { DEFAULT_CONVERSATION_LIST_LIMITS } from '../../account/constants';

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
  accountService.getConversationListLimits.mockReturnValue(DEFAULT_CONVERSATION_LIST_LIMITS);
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
        _id: 1, members: [1], deactivated: true, _delta: {
          remove: { members: Array(1) },
          set: { modified_at: 1535007198836, most_recent_content_modified_at: 1535007198836, version: 2916578790211584 },
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
    expect(notificationCenter.emitEntityPut).toHaveBeenCalledTimes(1);
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
      { _id: 3375110, version: 2484043918606336, modified_at: 1535014387734, post_cursor: 26 },
    ]);
    await handlePartialData(groups);
    expect(daoManager.getDao(GroupDao).update).toHaveBeenCalledTimes(1);
    expect(notificationCenter.emit).toHaveBeenCalledTimes(1);

    expect(notificationCenter.emitEntityPut).toHaveBeenCalledTimes(1);
    expect(GroupAPI.requestGroupById).not.toHaveBeenCalled();
  });

  it('should call api if can not find partial in DB', async () => {
    daoManager.getDao(GroupDao).get.mockReturnValueOnce(null);
    const groups: Partial<Raw<Group>>[] = toArrayOf<Partial<Raw<Group>>>([
      { _id: 3375110, version: 2484043918606336, modified_at: 1535014387734, post_cursor: 26 },
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
    expect(notificationCenter.emitEntityPut).toHaveBeenCalledTimes(2);
    expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(2);
    expect(notificationCenter.emitEntityReplaceAll).toHaveBeenCalledTimes(1);
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
    expect(notificationCenter.emitEntityPut).toHaveBeenCalledTimes(0);
  });
});

describe('filterGroups()', () => {

  it('should remove extra, when limit < data count', async () => {
    const LIMIT = 20;
    const TEAMS_COUNT = 50;

    const teams = generateFakeGroups(TEAMS_COUNT);

    const result = await filterGroups(teams, LIMIT);
    expect(result.length).toBe(LIMIT);
  });

  it('should return all, when limit > data count', async () => {
    const LIMIT = 20;
    const TEAMS_COUNT = 5;

    const teams = generateFakeGroups(TEAMS_COUNT);

    const result = await filterGroups(teams, LIMIT);
    expect(result.length).toBe(TEAMS_COUNT);
  });

  it('should return groups until unread group', async () => {
    const LIMIT = 2;
    const TEAMS_COUNT = 5;

    const teams = generateFakeGroups(TEAMS_COUNT);
    stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([{ id: 2, unread_count: 1 }]);

    const result = await filterGroups(teams, LIMIT);
    expect(result.length).toBe(4);
  });

  it('should return groups until unread @mention', async () => {
    const LIMIT = 2;
    const TEAMS_COUNT = 5;

    const teams = generateFakeGroups(TEAMS_COUNT);
    stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([{ id: 2, unread_mentions_count: 1 }]);

    const result = await filterGroups(teams, LIMIT);
    expect(result.length).toBe(4);
  });

  it('should return groups until oldest unread, when multiple groups have unread', async () => {
    const LIMIT = 2;
    const TEAMS_COUNT = 5;

    const teams = generateFakeGroups(TEAMS_COUNT);
    stateService.getAllGroupStatesFromLocal.mockResolvedValue([
      { id: 4, unread_count: 1 },
      { id: 3, unread_count: 1 },
    ]);

    const result = await filterGroups(teams, LIMIT);
    expect(result.length).toBe(3);
  });

  it('should also return groups that have not post', async () => {
    const LIMIT = 2;
    const TEAMS_COUNT = 5;

    const teams = generateFakeGroups(TEAMS_COUNT, { hasPost: false });
    stateService.getAllGroupStatesFromLocal.mockResolvedValueOnce([]);

    const result = await filterGroups(teams, LIMIT);
    expect(result.length).toBe(LIMIT);
  });
});
