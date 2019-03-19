/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 15:58:19
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { NoteProps, NoteViewProps } from './types';

import { Item } from 'sdk/module/item/entity';
import NoteItemModel from '@/store/models/NoteItem';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';

class NoteViewModel extends StoreViewModel<NoteProps> implements NoteViewProps {
  @computed
  get _items() {
    const items: NoteItemModel[] = [];
    this.props.ids.map((id: number) => {
      const item = getEntity<Item, NoteItemModel>(ENTITY_NAME.ITEM, id);
      if (item && !item.deactivated) {
        items.push(item);
      }
    });
    return items;
  }

  @computed
  get title() {
    return this._items.map((item: NoteItemModel) => item.title).join('');
  }

  @computed
  get summary() {
    return this._items.map((item: NoteItemModel) => item.summary).join('');
  }
}

export { NoteViewModel };
