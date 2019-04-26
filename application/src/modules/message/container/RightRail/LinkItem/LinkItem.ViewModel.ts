/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-09 14:13:08
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { Item } from 'sdk/module/item/entity';
import LinkItemModel from '@/store/models/LinkItem';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { dateFormatter } from '@/utils/date';
import { LinkItemProps, LinkItemViewProps } from './types';

class LinkItemViewModel extends AbstractViewModel<LinkItemProps>
  implements LinkItemViewProps {
  @computed
  get _id() {
    return this.props.id;
  }

  @computed
  get link() {
    return getEntity<Item, LinkItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  @computed
  get _person(): any {
    const { creatorId } = this.link;
    if (creatorId) {
      return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, creatorId);
    }
    return {};
  }

  @computed
  get personName() {
    return this._person.userDisplayName || '';
  }

  @computed
  get createdTime() {
    const { createdAt } = this.link;
    return dateFormatter.date(createdAt);
  }

  @computed
  get url() {
    let { url } = this.link;
    if (!/^http/.test(url)) {
      url = `http://${url}`;
    }
    return url;
  }
}

export { LinkItemViewModel };
