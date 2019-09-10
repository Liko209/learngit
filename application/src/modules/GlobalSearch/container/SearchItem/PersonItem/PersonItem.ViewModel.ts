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
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { Props, ISearchItemModel, RecentSearchTypes } from '../types';
import { SearchViewModel } from '../../common/Search.ViewModel';

class PersonItemViewModel extends SearchViewModel<Props>
  implements ISearchItemModel {
  constructor(props: Props) {
    super(props);

    this.reaction(
      () => this.person,
      async (person: PersonModel) => {
        const { didChange, recentId } = this.props;
        didChange();
        if (person.deactivated) {
          await this._getSearchService().removeRecentSearchRecords(
            new Set([recentId]),
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
    this._getSearchService().addRecentSearchRecord(
      RecentSearchTypes.PEOPLE,
      this.props.id,
    );
  };

  private _getSearchService() {
    return ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
  }
}

export { PersonItemViewModel };
