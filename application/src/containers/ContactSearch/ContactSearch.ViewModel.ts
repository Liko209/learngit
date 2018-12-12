/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-18 14:33:00
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action, computed } from 'mobx';
import { debounce } from 'lodash';

import PersonService from 'sdk/service/person';
import { Person, SortableModel } from 'sdk/models';
import { StoreViewModel } from '@/store/ViewModel';
import { ContactSearchProps, ViewProps, SelectedMember } from './types';

class ContactSearchViewModel extends StoreViewModel<ContactSearchProps>
  implements ViewProps {
  @observable
  existMembers: number[] = [];

  @observable
  suggestions: SelectedMember[] = [];

  @computed
  get label() {
    return this.props.label;
  }

  @computed
  get onChange() {
    return this.props.onChange;
  }

  @computed
  get placeholder() {
    return this.props.placeholder;
  }

  @computed
  get error() {
    return this.props.error;
  }

  @computed
  get helperText() {
    return this.props.helperText;
  }

  @computed
  private get _isExcludeMe() {
    return this.props.isExcludeMe;
  }

  @computed
  get errorEmail() {
    return this.props.errorEmail;
  }

  constructor(props: ContactSearchProps) {
    super(props);
    this.searchMembers = debounce(this.searchMembers.bind(this), 300);
  }

  @action
  fetchSearch = async (query: string) => {
    const personService = PersonService.getInstance<PersonService>();
    const result = await personService.doFuzzySearchPersons(
      query,
      this._isExcludeMe ? true : false,
    );

    if (result) {
      const filterMembers = result.sortableModels.filter(
        (member: SortableModel<Person>) => {
          return !this.existMembers.find(
            existMember => existMember === member.id,
          );
        },
      );
      return filterMembers;
    }
    return null;
  }

  @action
  searchMembers = (value: string) => {
    if (!value) {
      this.suggestions = [];
      return;
    }
    let members: SelectedMember[] = [];
    this.fetchSearch(value).then((data: SortableModel<Person>[]) => {
      members = data.map(member => ({
        id: member.id,
        label: member.displayName,
        email: member.entity.email,
      }));
      this.suggestions = members;
    });
  }
}

export { ContactSearchViewModel };
