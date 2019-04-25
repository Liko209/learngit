/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:45
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import { SearchService } from 'sdk/module/search';

import { Props, ISearchItemModel, RecentSearchTypes } from '../types';
import { SearchViewModel } from '../../common/Search.ViewModel';

class PersonItemViewModel extends SearchViewModel<Props>
  implements ISearchItemModel {
  constructor(props: Props) {
    super(props);

    this.reaction(
      () => this.person,
      () => (person: PersonModel) => {
        this.props.didChange();
        if (person.deactivated) {
          SearchService.getInstance().removeRecentSearchRecords(
            new Set([person.id]),
          );
        }
      },
    );
  }

  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get person() {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.id);
  }

  addRecentRecord = () => {
    SearchService.getInstance().addRecentSearchRecord(
      RecentSearchTypes.PEOPLE,
      this.props.id,
    );
  }
}

export { PersonItemViewModel };
