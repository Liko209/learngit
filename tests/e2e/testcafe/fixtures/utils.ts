import { TestHelper } from './../libs/helpers';
import { ProfileAPI, PersonAPI, StateAPI, GroupAPI } from '../libs/sdk';
import * as _ from 'lodash';
type ConversationParam = {
  type: 'team' | 'privateChat' | 'group';
  identifier: string;
  isFavorite?: boolean;
  isHidden?: boolean;
  isPublic?: boolean;
  members?: string[]; // if not specified, will generate automatically
};
type Group = {
  id: string;
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function setFavoriteConversations(t: TestController, groupIds: number[]) {
  const h = new TestHelper(t);
  h.log(`set groups ${groupIds.join(', ')} as favorites`);
  const user = (await PersonAPI.requestPersonById(h.users.user701.glip_id))
    .data;
  const profileId = user.profile_id;
  await (ProfileAPI as any).putDataById(profileId, {
    favorite_group_ids: groupIds,
  });
}

async function prepareConversations(
  t: TestController,
  params: ConversationParam[],
): Promise<{ [key: string]: Group }> {
  const result = {};
  const hiddenIds = [];
  const showIds = [];
  const favIds = [];
  const notFavIds = [];
  const h = new TestHelper(t);
  const client701 = await h.glipApiManager.getClient(
    h.users.user701,
    h.companyNumber,
  );
  let pvtChatMemberIndex = 1;
  let groupChatMemberIndex = 2;
  let teamChatMemberIndex = 2;
  function pad(d) {
    return d < 10 ? `0${d.toString()}` : d.toString();
  }
  function upperCaseFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  const generateMembersByType = (
    type: 'privateChat' | 'group' | 'team',
    members,
  ) => {
    if (members && members.length) {
      return members.map(name => h.users[`user${name}`].rc_id);
    }
    if (type === 'privateChat') {
      pvtChatMemberIndex++;
      return [
        h.users.user701.rc_id,
        h.users[`user7${pad(pvtChatMemberIndex)}`].rc_id,
      ];
    }

    if (type === 'group') {
      groupChatMemberIndex++;
      return [
        h.users.user701.rc_id,
        h.users.user702.rc_id,
        h.users[`user7${pad(groupChatMemberIndex)}`].rc_id,
      ];
    }
    if (type === 'team') {
      teamChatMemberIndex++;
      return [
        h.users.user701.rc_id,
        h.users.user702.rc_id,
        h.users[`user7${pad(teamChatMemberIndex)}`].rc_id,
      ];
    }
  };
  await h.log('Should create conversations');
  await asyncForEach(
    params,
    async ({
      type,
      identifier,
      isFavorite = false,
      isHidden = false,
      isPublic = true,
      members = [],
    }) => {
      const param = {
        isPublic,
        type: upperCaseFirst(type),
        description: 'test',
        members: generateMembersByType(type, members),
      };
      if (type === 'team') {
        param['name'] = `My Team ${Math.random().toString(10)}`;
      }
      const conversation = (await client701.createGroup(param)).data;
      h.log(`${identifier} ${conversation.id} is created.`);
      if (isHidden) {
        hiddenIds.push(+conversation.id);
      } else {
        showIds.push(+conversation.id);
      }
      if (isFavorite) {
        favIds.push(+conversation.id);
      }
      result[identifier] = conversation;
    },
  );
  const user = (await PersonAPI.requestPersonById(h.users.user701.glip_id))
    .data;
  const profileId = user.profile_id;
  const profileParams = {};
  hiddenIds.forEach((id: number) => {
    profileParams[`hide_group_${id}`] = true;
  });
  showIds.forEach((id: number) => {
    profileParams[`hide_group_${id}`] = false;
  });
  const profile = (await (ProfileAPI as any).requestProfileById(profileId))
    .data;
  const initialFavIds = profile['favorite_group_ids'] || [];
  let finalFavIds = initialFavIds;
  if (initialFavIds.length && notFavIds.length) {
    finalFavIds = _.without(initialFavIds, ...notFavIds);
  }
  if (favIds) {
    profileParams['favorite_group_ids'] = finalFavIds.concat(favIds);
  }
  await (ProfileAPI as any).putDataById(profileId, profileParams);
  return result;
}

async function sendPost(
  t: TestController,
  user: string = '701',
  groupId: number,
  text: string,
) {
  const h = new TestHelper(t);
  h.log(`user${user} sends a post to conversation ${groupId}`);
  const client701 = await h.glipApiManager.getClient(
    h.users[`user${user}`],
    h.companyNumber,
  );
  return client701.sendPost(+groupId, { text });
}

async function markAsRead(
  t: TestController,
  stateId: number,
  groupIds: number | number[],
) {
  const ids: number[] = [].concat(groupIds);
  const h = new TestHelper(t);
  h.log(`Mark the conversation ${ids.join(', ')} as read`);
  const readThrough = {};
  await asyncForEach(ids, async (id: number) => {
    const group = (await GroupAPI.requestGroupById(id)).data;
    readThrough[id] = group.most_recent_post_id;
  });
  const params = _.assign(
    {},
    ...ids.map(id => ({
      [`unread_count:${id}`]: 0,
      [`unread_mentions_count:${id}`]: 0,
      [`unread_deactivated_count:${id}`]: 0,
      [`read_through:${id}`]: readThrough[id],
      [`marked_as_unread:${id}`]: false,
    })),
  );
  await (StateAPI as any).saveStatePartial(stateId, params);
}

async function clearAllUMI(t: TestController) {
  const h = new TestHelper(t);
  const person = (await PersonAPI.requestPersonById(h.users.user701.glip_id))
    .data;
  const stateId = person.state_id;
  const state = (await (StateAPI as any).getDataById(stateId)).data;
  const unreadGroups = Object.keys(state)
    .filter((key: string) => {
      return (
        (/unread_count:/.test(key) || /unread_mentions_count:/.test(key)) &&
        state[key] > 0
      );
    })
    .map((key: string) => +key.replace(/[^\d]+/, ''));

  await markAsRead(t, stateId, unreadGroups);
}

export {
  setFavoriteConversations,
  prepareConversations,
  sendPost,
  markAsRead,
  clearAllUMI,
};
