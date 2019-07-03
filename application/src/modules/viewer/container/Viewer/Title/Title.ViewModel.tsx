/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-06 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractViewModel } from '@/base';
import { ViewerTitleProps } from './types';
import _ from 'lodash';
import { computed, observable } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Item } from 'sdk/module/item/entity';
import FileItemModel from '@/store/models/FileItem';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';

class ViewerTitleViewModel extends AbstractViewModel<ViewerTitleProps> {
  @observable sender: PersonModel | null;
  @observable createdAt: number | null;

  constructor(props: ViewerTitleProps) {
    super(props);
    this.sender = null;
    this.createdAt = null;
    this.autorun(this.updateSenderInfo);
  }

  @computed
  get item() {
    return getEntity<Item, FileItemModel>(
      ENTITY_NAME.ITEM,
      this.props.currentItemId,
    );
  }

  updateSenderInfo = async () => {
    const post = await this.item.getDirectRelatedPostInGroup(
      this.props.groupId,
    );

    if (post) {
      this.sender = getEntity<Person, PersonModel>(
        ENTITY_NAME.PERSON,
        post.creator_id,
      );
      this.createdAt = post.created_at;
      return;
    }
    this.sender = null;
    this.createdAt = null;
    return;
  }
}

export { ViewerTitleViewModel };
