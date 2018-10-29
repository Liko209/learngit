/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import PostModel from '@/store/models/Post';
import CompanyModel from '@/store/models/Company';
import { getEntity, getGlobalValue } from '@/store/utils';
import { Post, Person, Company } from 'sdk/models';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import PersonModel from '@/store/models/Person';
import { FormatToHtml } from './FormatToHtml';

class FormatMessagesViewModel extends StoreViewModel<{ postId: number }> {
  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.props.postId);
  }

  @computed
  private get _atMentionIdMaps() {
    const post = this._post;
    const atMentionNonItemIds = (post && post.atMentionNonItemIds) || [];
    const kv = {};
    atMentionNonItemIds.forEach((personId: number) => {
      kv[personId] = getEntity<Person, PersonModel>(
        ENTITY_NAME.PERSON,
        personId,
      ).displayName;
    });
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
    const company = getEntity<Company, CompanyModel>(ENTITY_NAME.COMPANY, currentCompanyId) || {};
    return company.customEmoji || {};
  }

  @computed
  private get _staticHttpServer() {
    return getGlobalValue(GLOBAL_KEYS.STATIC_HTTP_SERVER);
  }

  @computed
  get formatHtml() {
    const transform = new FormatToHtml(this._post.text);
    transform.glipdown(this._atMentionIdMaps, this._currentUserId).formatToEmoji(this._staticHttpServer, this._customEmojiMap);
    return transform.text;
  }
}
export { FormatMessagesViewModel };
