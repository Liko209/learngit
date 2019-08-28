import { mapGroupModelToItem } from '../lib';
import { CONVERSATION_TYPES } from '@/constants';
import { GroupSearchItem } from '@/containers/Downshift/GroupSearch/GroupSearchItem';
import { ContactSearchItem } from '@/containers/Downshift/ContactSearch/ContactSearchItem';
import * as utils from '@/store/utils';

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
