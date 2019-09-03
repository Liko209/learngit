import { mapGroupModelToItem, recentFirstSorter, searchFunc } from '../lib';
import { CONVERSATION_TYPES } from '@/constants';
import { GroupSearchItem } from '@/containers/Downshift/GroupSearch/GroupSearchItem';
import { ContactSearchItem } from '@/containers/Downshift/ContactSearch/ContactSearchItem';
import * as utils from '@/store/utils';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import prettyFormat from 'pretty-format';

const groupId = 123;
const userId = 0;
const Team = {
  id: groupId,
  type: CONVERSATION_TYPES.TEAM,
  members: [userId, 1],
};
const Me = {
  id: groupId,
  type: CONVERSATION_TYPES.ME,
  members: [userId],
};
const One2One = {
  id: groupId,
  type: CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
  members: [userId, 1],
};
const Group = {
  id: groupId,
  type: CONVERSATION_TYPES.NORMAL_GROUP,
  members: [userId, 1],
};
const SMS = {
  id: groupId,
  type: CONVERSATION_TYPES.SMS,
  members: [userId, 1],
};

describe('GroupSearch/lib', () => {
  it('should get correct item', () => {
    jest.spyOn(utils, 'getGlobalValue').mockReturnValue(userId);
    expect(mapGroupModelToItem(Team)).toEqual({
      Item: GroupSearchItem,
      props: {
        itemId: groupId,
        size: 'large',
      },
    });
    expect(mapGroupModelToItem(Group)).toEqual({
      Item: GroupSearchItem,
      props: {
        itemId: groupId,
        size: 'large',
      },
    });
    expect(mapGroupModelToItem(One2One)).toEqual({
      Item: ContactSearchItem,
      props: {
        itemId: 1,
        showEmail: false,
        size: 'large',
      },
    });
    expect(mapGroupModelToItem(Me)).toEqual({
      Item: ContactSearchItem,
      props: {
        itemId: userId,
        showEmail: false,
        size: 'large',
      },
    });
    expect(mapGroupModelToItem(SMS)).toEqual({
      Item: ContactSearchItem,
      props: {
        itemId: 1,
        showEmail: false,
        size: 'large',
      },
    });
  });
});

describe('recentFirstSorter()', () => {
  it('should sort by weight first, then most_recent_post_created_at, then name', () => {
    const datum = [
      {
        id: 0,
        sortWeights: [1],
        entity: { displayName: 'A', most_recent_post_created_at: 100 },
      },
      {
        id: 0,
        sortWeights: [1],
        entity: { displayName: 'D', most_recent_post_created_at: 100 },
      },
      {
        id: 1,
        sortWeights: [1],
        entity: { displayName: 'B', most_recent_post_created_at: 300 },
      },
      {
        id: 2,
        sortWeights: [2],
        entity: { displayName: 'A', most_recent_post_created_at: 400 },
      },
      {
        id: 3,
        sortWeights: [2],
        entity: { displayName: 'C', most_recent_post_created_at: 100 },
      },
      {
        id: 4,
        sortWeights: [2],
        entity: { displayName: 'A', most_recent_post_created_at: 200 },
      },
      {
        id: 5,
        sortWeights: [2],
        entity: { displayName: 'D', most_recent_post_created_at: 100 },
      },
    ];
    expect(datum.sort(recentFirstSorter)).toEqual([
      {
        entity: { displayName: 'A', most_recent_post_created_at: 400 },
        id: 2,
        sortWeights: [2],
      },
      {
        entity: { displayName: 'A', most_recent_post_created_at: 200 },
        id: 4,
        sortWeights: [2],
      },
      {
        entity: { displayName: 'C', most_recent_post_created_at: 100 },
        id: 3,
        sortWeights: [2],
      },
      {
        entity: { displayName: 'D', most_recent_post_created_at: 100 },
        id: 5,
        sortWeights: [2],
      },
      {
        entity: { displayName: 'B', most_recent_post_created_at: 300 },
        id: 1,
        sortWeights: [1],
      },
      {
        entity: { displayName: 'A', most_recent_post_created_at: 100 },
        id: 0,
        sortWeights: [1],
      },
      {
        entity: { displayName: 'D', most_recent_post_created_at: 100 },
        id: 0,
        sortWeights: [1],
      },
    ]);
  });
});

describe('groupSearch', () => {
  const searchService = {
    doFuzzySearchPersonsAndGroups: jest.fn(async () => ({
      sortableModels: [],
    })),
  };
  ServiceLoader.getInstance = jest.fn().mockReturnValue(searchService);

  it('should call searchService.doFuzzySearchPersonsAndGroups with correct arguments when called', async () => {
    await searchFunc('', false);
    await searchFunc('', true);
    await searchFunc('some', false);
    await searchFunc('some', true);
    expect(searchService.doFuzzySearchPersonsAndGroups).toHaveBeenCalled();
    expect(
      prettyFormat(searchService.doFuzzySearchPersonsAndGroups.mock.calls),
    ).toMatchSnapshot();
  });
});
