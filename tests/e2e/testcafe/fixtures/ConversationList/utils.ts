import { TestHelper } from './../../libs/helpers';
import { ProfileAPI, PersonAPI } from '../../libs/sdk';
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
      h.log(`${type} ${conversation.id} is created.`);
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
  h.log('Show the groups again in case it was set hidden before');
  return result;
}

export { prepareConversations };
