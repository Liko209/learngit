/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 15:58:19
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { NoteProps, NoteViewProps } from './types';

import { Item } from 'sdk/module/item/entity';
import NoteItemModel from '@/store/models/NoteItem';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';

class NoteViewModel extends AbstractViewModel<NoteProps>
  implements NoteViewProps {
  @computed
  get _ids() {
    return this.props.ids;
  }

  @computed
  get _items() {
    const items: NoteItemModel[] = [];
    this._ids.map((id: number) => {
      const item = getEntity<Item, NoteItemModel>(ENTITY_NAME.NOTE_ITEM, id);
      if (item && !item.isMocked && !item.deactivated) {
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
