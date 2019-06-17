/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 15:58:19
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { NoteProps, NoteViewProps } from './types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { Item } from 'sdk/module/item/entity';
import NoteItemModel from '@/store/models/NoteItem';
import { ItemService } from 'sdk/module/item/service';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';

const GET_NOTE_ERROR = 'Error';
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

  getBodyInfo = async () => {
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    if (!this._items || !this._items[0]) return GET_NOTE_ERROR;
    try {
      return await itemService.getNoteBody(this._items[0].id);
    } catch (error) {
      return GET_NOTE_ERROR;
    }
  }
}

export { NoteViewModel };
