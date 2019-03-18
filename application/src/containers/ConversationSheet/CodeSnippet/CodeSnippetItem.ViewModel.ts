/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-01-16 17:32:09
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { getEntity } from '@/store/utils';
import { Item } from 'sdk/module/item/entity';
import { ENTITY_NAME } from '@/store';
import CodeSnippetItem from '@/store/models/CodeItem';
import { CodeSnippetViewModelProps } from './types';

export class CodeSnippetViewModel extends StoreViewModel<
  CodeSnippetViewModelProps
> {
  @computed
  private get _id() {
    return this.props.ids[0];
  }

  @computed
  get postItem() {
    return getEntity<Item, CodeSnippetItem>(ENTITY_NAME.ITEM, this._id);
  }
}
