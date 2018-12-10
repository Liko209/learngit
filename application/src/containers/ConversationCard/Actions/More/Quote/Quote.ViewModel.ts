/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-10 16:17:36
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { GroupService } from 'sdk/service';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import PostModel from '@/store/models/Post';
import { Post } from 'sdk/models';

class QuoteViewModel extends StoreViewModel<Props> implements ViewProps {
  @observable
  quoteText: string;
  @computed
  private get _id() {
    return this.props.id;
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._id);
  }

  @computed
  private get _text() {
    return this._post.text;
  }

  @computed
  private get _groupId() {
    return this._post.groupId;
  }

  quote = () => {
    this.quoteText = `${this._text}`;
    this.updateDraft(this.quoteText);
  }

  updateDraft = (draft: string) => {
    const groupService: GroupService = GroupService.getInstance();
    groupService.updateGroupDraft({
      draft,
      id: this._groupId,
    });
  }
}

export { QuoteViewModel };
