/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-10 16:17:36
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { notificationCenter } from 'sdk/service';
import { GroupConfigService } from 'sdk/module/groupConfig';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import PostModel from '@/store/models/Post';
import { Post } from 'sdk/module/post/entity';
import { Person } from 'sdk/module/person/entity';
import { UI_NOTIFICATION_KEY } from '@/constants';
import PersonModel from '@/store/models/Person';
import { mainLogger } from 'sdk';

class QuoteViewModel extends StoreViewModel<Props> implements ViewProps {
  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.props.id);
  }

  @computed
  get disabled() {
    return this.props.disabled;
  }

  @computed
  private get _creatorId() {
    return this._post.creatorId;
  }

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

  @action
  getQuoteText = () => {
    let quoteText = this._text;

    if (!quoteText.endsWith('\n')) {
      quoteText += '\n';
    }
    quoteText = quoteText.replace(
      /^(>\s)?(.*?)\n/gim,
      ($0: string, $1: string, $2: string) => `> ${$2}<br/>`,
    );

    return `${quoteText}<br/><br/><br/>`;
  }

  @action
  getQuoteHead = () => {
    const { userDisplayName: name, id } = this._creator;
    // tslint:disable-next-line
    const quoteHead = `<span class='mention' data-id='${id}' data-name='${name}' data-denotation-char='@'><span contenteditable='false'><span class='ql-mention-denotation-char'>@</span>${name}</span></span> wrote:<br />`;
    return quoteHead;
  }

  private get _renderedText() {
    return `${this.getQuoteHead()}${this.getQuoteText()}`;
  }

  @action
  quote = () => {
    this._groupId && this.updateDraft(this._renderedText);
  }

  @action
  updateDraft = async (draft: string) => {
    notificationCenter.emit(UI_NOTIFICATION_KEY.QUOTE, {
      quote: draft,
      groupId: this._groupId,
    });
    const groupConfigService: GroupConfigService = GroupConfigService.getInstance();
    try {
      await groupConfigService.updateDraft({
        draft,
        id: this._groupId,
      });
    } catch (error) {
      mainLogger.error(error);
    }
  }
}

export { QuoteViewModel };
