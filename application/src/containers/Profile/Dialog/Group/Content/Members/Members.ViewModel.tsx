/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action, computed } from 'mobx';
import { ProfileDialogGroupViewModel } from '../../Group.ViewModel';
import { MembersProps, MembersViewProps } from './types';
import SortableGroupMemberHandler from '@/store/handler/SortableGroupMemberHandler';
import { PersonService } from 'sdk/module/person';
import { Person } from 'sdk/module/person/entity';
import { SortableModel } from 'sdk/framework/model';
import { debounce } from 'lodash';

const DELAY_DEBOUNCE = 300;

class MembersViewModel extends ProfileDialogGroupViewModel
  implements MembersViewProps {
  @observable
  private _sortableGroupMemberHandler: SortableGroupMemberHandler | null = null;
  private _personService = PersonService.getInstance<PersonService>();
  @observable
  filteredMemberIds: number[] = [];

  constructor(props: MembersProps) {
    super(props);
    this.doFuzzySearchPersons = debounce(
      this.doFuzzySearchPersons.bind(this),
      DELAY_DEBOUNCE,
    );
    this.autorun(this._createSortableHandler);
    this.reaction(
      () => this.sortedAllMemberIds,
      (ids: number[]) => (this.filteredMemberIds = ids),
    );
  }

  private _createSortableHandler = async () => {
    // This handler need observable
    this._sortableGroupMemberHandler = await SortableGroupMemberHandler.createSortableGroupMemberHandler(
      this.id,
    );
  }

  @computed
  get sortedAllMemberIds() {
    if (this._sortableGroupMemberHandler === null) {
      return [];
    }
    // getSortedGroupMembersIds is computed
    return this._sortableGroupMemberHandler.getSortedGroupMembersIds();
  }

  @action
  doFuzzySearchPersons = async (keywords: string) => {
    const result = await this._personService.doFuzzySearchPersons(
      keywords,
      false,
      this.sortedAllMemberIds,
      true,
      true,
    );
    if (result !== null) {
      const ids = result.sortableModels.map(
        (person: SortableModel<Person>) => person.id,
      );
      this.filteredMemberIds = ids;
    }
  }
}
export { MembersViewModel };
