/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-05 15:05:19
 * Copyright © RingCentral. All rights reserved.
 */
import PostModel from '@/store/models/Post';
import GroupModel from '@/store/models/Group';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group/entity';
import { getEntity, getGlobalValue } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { i18nP } from '@/utils/i18nT';
import { AtMentionsMapType } from '@/common/postParser';

const _getDisplayName = (id: number) => {
  const type = GlipTypeUtil.extractTypeId(id);

  switch (type) {
    case TypeDictionary.TYPE_ID_TEAM:
      return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, id).displayName;

    case TypeDictionary.TYPE_ID_PERSON:
      return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, id)
        .userDisplayName;

    default:
      return undefined;
  }
};

const buildAtMentionMap = (post: PostModel) => {
  const atMentionNonItemIds = (post && post.atMentionNonItemIds) || [];
  const kv: AtMentionsMapType = {};
  atMentionNonItemIds.forEach((id: number) => {
    kv[id] = {
      name: _getDisplayName(id),
      isCurrent: id === getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID),
    };
  });
  kv['-1'] = {
    name: post.isAdminMention
      ? i18nP('message.atMentionAllAdmin')
      : i18nP('message.atMentionAllTeam'),
    isCurrent:
      post.isTeamMention ||
      (post.isAdminMention &&
        getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, post.groupId).isAdmin),
  };
  return kv;
};

export { buildAtMentionMap };
