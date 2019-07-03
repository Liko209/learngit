/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import PostModel from '@/store/models/Post';
import GroupModel from '@/store/models/Group';
import CompanyModel from '@/store/models/Company';
import { getEntity, getGlobalValue } from '@/store/utils';
import { Post } from 'sdk/module/post/entity';
import { Person } from 'sdk/module/person/entity';
import { Group } from 'sdk/module/group/entity';
import { Company } from 'sdk/module/company/entity';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import PersonModel from '@/store/models/Person';
import { TextMessageProps } from './types';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import {
  moizePostParser,
  AtMentionsMapType,
  ChildrenType,
} from '@/common/postParser';
import { i18nP } from '@/utils/i18nT';
import { action } from 'mobx';

class TextMessageViewModel extends StoreViewModel<TextMessageProps> {
  static customEmojiMap() {
    const currentCompanyId = getGlobalValue(GLOBAL_KEYS.CURRENT_COMPANY_ID);
    if (currentCompanyId <= 0) {
      return {};
    }
    const company =
      getEntity<Company, CompanyModel>(ENTITY_NAME.COMPANY, currentCompanyId) ||
      {};
    return company.customEmoji || {};
  }

  static staticHttpServer() {
    return getGlobalValue(GLOBAL_KEYS.STATIC_HTTP_SERVER);
  }

  static get currentUserId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  static getGroup(id: number) {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, id);
  }

  static getPerson(id: number) {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, id);
  }

  static getDisplayName(id: number) {
    const type = GlipTypeUtil.extractTypeId(id);

    switch (type) {
      case TypeDictionary.TYPE_ID_TEAM:
        return TextMessageViewModel.getGroup(id).displayName;

      case TypeDictionary.TYPE_ID_PERSON:
        return TextMessageViewModel.getPerson(id).userDisplayName;

      default:
        return undefined;
    }
  }

  content: ChildrenType;

  constructor(props: TextMessageProps) {
    super(props);
    this.content = this._getContent(props.keyword);
  }

  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.props.id);
  }

  private get _atMentions() {
    const post = this._post;
    const atMentionNonItemIds = (post && post.atMentionNonItemIds) || [];
    const kv: AtMentionsMapType = {};
    atMentionNonItemIds.forEach((id: number) => {
      kv[id] = {
        name: TextMessageViewModel.getDisplayName(id),
        isCurrent: id === TextMessageViewModel.currentUserId,
      };
    });
    kv['-1'] = {
      name: post.isAdminMention
        ? i18nP('message.atMentionAllAdmin')
        : i18nP('message.atMentionAllTeam'),
      isCurrent:
        post.isTeamMention ||
        (post.isAdminMention &&
          TextMessageViewModel.getGroup(post.groupId).isAdmin),
    };
    return kv;
  }

  @action
  private _getContent = (keyword?: string) => {
    return moizePostParser(this._post.text, {
      keyword,
      html: true,
      atMentions: {
        map: this._atMentions,
      },
      emoji: {
        hostName: TextMessageViewModel.staticHttpServer(),
        customEmojiMap: TextMessageViewModel.customEmojiMap(),
      },
      phoneNumber: true,
    });
  }
}

export { TextMessageViewModel };
