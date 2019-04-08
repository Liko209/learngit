/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:45
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Person } from 'sdk/module/person/entity';
import PersonModel from '@/store/models/Person';
import { SearchService } from 'sdk/module/search';
import { Props, ISearchItemModel, RecentSearchTypes } from '../types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

class PersonItemViewModel extends StoreViewModel<Props>
  implements ISearchItemModel {
  constructor(props: Props) {
    super(props);
    const { sectionIndex, cellIndex } = props;

    this.reaction(
      () => this.person,
      () => (person: PersonModel) => {
        this.props.didChange(sectionIndex, cellIndex);
        if (person.deactivated) {
          const searchService = ServiceLoader.getInstance<SearchService>(
            ServiceConfig.SEARCH_SERVICE,
          );
          searchService.removeRecentSearchRecords(new Set([person.id]));
        }
      },
    );
  }

  @computed
  get person() {
    const { id } = this.props;
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, id);
  }

  @computed
  get hovered() {
    const { sectionIndex, selectIndex, cellIndex } = this.props;
    return sectionIndex === selectIndex[0] && cellIndex === selectIndex[1];
  }

  addRecentRecord = () => {
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    searchService.addRecentSearchRecord(
      RecentSearchTypes.PEOPLE,
      this.props.id,
    );
  }
}

export { PersonItemViewModel };
