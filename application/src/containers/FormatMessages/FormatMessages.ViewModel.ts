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
import { FormatText } from './FormatText';

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
  private get _currentCompanyId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_COMPANY_ID);
  }

  @computed
  private get _customEmoji() {
    const company = getEntity<Company, CompanyModel>(ENTITY_NAME.COMPANY, this._currentCompanyId) || {};
    return company.customEmoji || {};
  }

  @computed
  get formatHtml() {
    console.log(111111, this._customEmoji);
    const formatText = new FormatText(this._post.text);
    formatText.glipdown(this._atMentionIdMaps, this._currentUserId);
    return formatText.text;
  }
}
export { FormatMessagesViewModel };
