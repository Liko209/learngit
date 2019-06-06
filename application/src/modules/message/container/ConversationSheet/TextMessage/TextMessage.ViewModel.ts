/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { container } from 'framework';
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
import { TelephonyService } from '@/modules/telephony/service';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { postParser, AtMentionsMapType } from '@/common/postParser';
import i18nT from '@/utils/i18nT';

class TextMessageViewModel extends StoreViewModel<TextMessageProps> {
  private _featuresFlagsService: FeaturesFlagsService = container.get(
    FeaturesFlagsService,
  );
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  canUseTelephony = async () => {
    return await this._featuresFlagsService.canUseTelephony();
  }
  directCall = (phoneNumber: string) => {
    this._telephonyService.directCall(phoneNumber);
  }
  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.props.id);
  }

  getGroup(id: number) {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, id);
  }

  getPerson(id: number) {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, id);
  }

  private _getDisplayName(id: number) {
    const type = GlipTypeUtil.extractTypeId(id);

    switch (type) {
      case TypeDictionary.TYPE_ID_TEAM:
        return this.getGroup(id).displayName;

      case TypeDictionary.TYPE_ID_PERSON:
        return this.getPerson(id).userDisplayName;

      default:
        return undefined;
    }
  }

  private async _getAtMentions() {
    const post = this._post;
    const atMentionNonItemIds = (post && post.atMentionNonItemIds) || [];
    const kv: AtMentionsMapType = {};
    atMentionNonItemIds.forEach((id: number) => {
      kv[id] = {
        name: this._getDisplayName(id),
        isCurrent: id === this._currentUserId,
      };
    });
    kv['-1'] = {
      name: await i18nT('message.atMentionAllTeam'),
      isCurrent: true,
    };
    return kv;
  }

  @computed
  private get _currentUserId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  @computed
  private get _customEmojiMap() {
    const currentCompanyId = getGlobalValue(GLOBAL_KEYS.CURRENT_COMPANY_ID);
    if (currentCompanyId <= 0) {
      return {};
    }
    const company =
      getEntity<Company, CompanyModel>(ENTITY_NAME.COMPANY, currentCompanyId) ||
      {};
    return company.customEmoji || {};
  }

  @computed
  private get _staticHttpServer() {
    return getGlobalValue(GLOBAL_KEYS.STATIC_HTTP_SERVER);
  }

  getContent = async (keyword?: string) => {
    return postParser(this._post.text, {
      keyword,
      html: true,
      atMentions: {
        map: await this._getAtMentions(),
      },
      emoji: {
        hostName: this._staticHttpServer,
        customEmojiMap: this._customEmojiMap,
      },
      phoneNumber: true,
    });
  }
}
export { TextMessageViewModel };
