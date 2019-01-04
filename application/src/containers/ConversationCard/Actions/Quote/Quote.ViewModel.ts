/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-10 16:17:36
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { GroupService } from 'sdk/service';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import PostModel from '@/store/models/Post';
import { Post } from 'sdk/module/post/entity';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';

class QuoteViewModel extends StoreViewModel<Props> implements ViewProps {
  @computed
  private get _id() {
    return this.props.id;
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._id);
  }

  @computed
  get disabled() {
    return this.props.disabled;
  }

  @computed
  private get _creatorId() {
    return this._post.creatorId;
  }

  @computed
  private get _creator() {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this._creatorId);
  }

  @computed
  private get _text() {
    return this._post.text;
  }

  @computed
  private get _groupId() {
    return this._post.groupId;
  }

  getQuoteText = () => {
    let quoteText = this._text;

    quoteText = quoteText.replace(
      /^(>\s)?(.*?)\n/gim,
      ($0, $1, $2) => `> ${$2}<br/>`,
    );

    return `${quoteText}<br/><br/>`;
  }

  getQuoteHead = () => {
    const { userDisplayName: name, id } = this._creator;
    // tslint:disable-next-line
    const quoteHead = `<span class='mention' data-id='${id}' data-name='${name}' data-denotation-char='@'><span contenteditable='false'><span class='ql-mention-denotation-char'>@</span>${name}</span></span> wrote:<br />`;
    return quoteHead;
  }

  @computed
  private get _renderedText() {
    return `${this.getQuoteHead()}${this.getQuoteText()}`;
  }

  quote = () => {
    this.updateDraft(this._renderedText);
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
