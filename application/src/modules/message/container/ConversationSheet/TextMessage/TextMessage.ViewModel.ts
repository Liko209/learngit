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
import { action } from 'mobx';
import { buildAtMentionMap } from '@/common/buildAtMentionMap';

class TextMessageViewModel extends StoreViewModel<TextMessageProps> {
  content: ChildrenType;

  constructor(props: TextMessageProps) {
    super(props);
    this.content = this._getContent(props.keyword);
  }

  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.props.id);
  }

  @action
  private _getContent = (keyword?: string) => {
    return moizePostParser(this._post.text, {
      keyword,
      html: true,
      atMentions: {
        map: buildAtMentionMap(this._post),
      },
      emoji: {
        unicodeOnly: false,
      },
      phoneNumber: true,
    });
  }
}

export { TextMessageViewModel };
