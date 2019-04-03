/*
 * @Author: isaac.liu
 * @Date: 2019-01-14 14:22:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { Item } from 'sdk/module/item/entity';
import NoteItemModel from '@/store/models/NoteItem';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { NoteProps } from './types';

class NoteItemViewModel extends AbstractViewModel<NoteProps> {
  @computed
  get _id() {
    return this.props.id;
  }

  @computed
  get note() {
    const id = this._id;
    if (typeof id !== 'undefined') {
      return getEntity<Item, NoteItemModel>(ENTITY_NAME.ITEM, id);
    }
    return null;
  }

  @computed
  get title() {
    const note = this.note;
    if (note) {
      return note.title;
    }
    return '';
  }

  @computed
  get subTitle() {
    const note = this.note;
    if (note) {
      const { creatorId } = note;
      if (creatorId) {
        const personName = getEntity<Person, PersonModel>(
          ENTITY_NAME.PERSON,
          creatorId,
        ).userDisplayName;
        return personName;
      }
      return '';
    }
    return '';
  }
}

export { NoteItemViewModel };
