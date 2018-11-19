/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-18 14:33:00
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';
import { debounce } from 'lodash';

import SearchService from 'sdk/service/search';
import { Person } from 'sdk/src/models';
import { StoreViewModel } from '@/store/ViewModel';
import { ContactSearchProps, ViewProps, SelectedMember } from './types';
import { getName } from './helper/getName';

class ContactSearchViewModel extends StoreViewModel<ContactSearchProps>
  implements ViewProps {
  @observable
  existMembers: number[] = [];

  @observable
  suggestions: SelectedMember[] = [];

  @observable
  label: string;

  @observable
  onChange: (item: any) => void;

  @observable
  placeholder: string;

  @observable
  error: boolean;

  @observable
  helperText: string;

  @observable
  errorEmail: string;

  constructor(props: ContactSearchProps) {
    super(props);
    this.searchMembers = debounce(this.searchMembers.bind(this), 300);
  }

  @action
  onReceiveProps({
    label,
    onChange,
    placeholder,
    error,
    helperText,
    errorEmail,
  }: ContactSearchProps) {
    this.label = label;
    this.onChange = onChange;
    this.placeholder = placeholder;
    this.error = error;
    this.helperText = helperText;
    this.errorEmail = errorEmail;
  }

  @action
  fetchSearch = async (query: string) => {
    const searchService = SearchService.getInstance<SearchService>();
    const result = await searchService.searchMembers(query);
    const filterMembers = result.filter((member: Person) => {
      return !this.existMembers.find(existMember => existMember === member.id);
    });
    return filterMembers;
  }

  @action
  searchMembers = (value: string) => {
    if (!value) {
      this.suggestions = [];
      return;
    }
    let members: SelectedMember[] = [];
    this.fetchSearch(value).then((data: Person[]) => {
      console.log('------data----', data);
      members = data.map(member => ({
        id: member.id,
        label: getName(member),
        email: member.email,
      }));
      // console.log('------members----', members);
      this.suggestions = members;
    });
  }
}

export { ContactSearchViewModel };
