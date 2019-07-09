/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import PostModel from '@/store/models/Post';
import { getEntity } from '@/store/utils';
import { Post } from 'sdk/module/post/entity';
import { ENTITY_NAME } from '@/store';
import { TextMessageProps } from './types';
import { moizePostParser, ChildrenType } from '@/common/postParser';
import {
  action,
  observable,
  computed,
  comparer
} from 'mobx';
import { buildAtMentionMap } from '@/common/buildAtMentionMap';

class TextMessageViewModel extends StoreViewModel<TextMessageProps> {
  @observable.shallow
  private _content: ChildrenType = [];

  @observable
  private _text: string;

  private _textType: boolean;

  constructor(props: TextMessageProps) {
    super(props);
    this.reaction(() => ({
      text: this._post.text,
      keyword: props.keyword,
    }), ({ text, keyword }) => {
      const res = this._getContent(text, keyword);
      this._textType = typeof res === 'string';
      console.log(this._textType, res);
      if (this._textType) {
        this._text = res as string;
      } else {
        this._content = res;
      }
    }, {
      fireImmediately: true,
      equals: comparer.structural
    });
  }

  @computed
  get renderText() {
    return this._textType ? this._text : this._content;
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.props.id);
  }

  @action
  private _getContent = (text: string, keyword?: string) => moizePostParser(text, {
    keyword,
    html: true,
    atMentions: {
      map: buildAtMentionMap(this._post),
    },
    emoji: {
      unicodeOnly: false,
    },
    phoneNumber: true,
  })
}

export { TextMessageViewModel };
