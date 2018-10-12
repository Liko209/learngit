/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-18 14:33:00
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';

import SearchService from 'sdk/service/search';
import { Person } from 'sdk/src/models';
import { AbstractViewModel } from '@/base';
import { ViewProps, ContactSearchProps } from './types';

class ContactSearchViewModel extends AbstractViewModel implements ViewProps {
  @observable
  existMembers: number[] = [];
  @observable
  label: string;
  @observable
  onChange: (item: any) => void;
  placeholder: string;
  error: boolean;
  helperText: string;
  @action
  onReceiveProps({
    label,
    onChange,
    placeholder,
    error,
    helperText,
  }: ContactSearchProps) {
    this.label = label;
    this.onChange = onChange;
    this.placeholder = placeholder;
    this.error = error;
    this.helperText = helperText;
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
}

export { ContactSearchViewModel };
