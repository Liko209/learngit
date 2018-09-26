/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-18 13:46:56
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { TranslationFunction, i18n } from 'i18next';
import JuiDownshiftMultiple from 'ui-components/molecules/Downshift';

import Chip from '../Chip';
import SearchContactItem from './SearchContactItem';
import SearchContactVM from './SearchContactVM';
import { getName } from '../../utils/getName';
import { Person } from 'sdk/src/models';

interface IProps {
  i18n: i18n;
  t: TranslationFunction;
  onChange: (item: any) => void;
  label: string;
  placeholder: string;
  error: boolean;
  helperText: string;
}

interface ISelectedMember {
  id: number;
  label: string;
  email: string;
}

interface IStates {
  suggestions: ISelectedMember[];
}

class SearchContact extends Component<IProps, IStates> {
  searchContactVM: SearchContactVM;
  constructor(props: IProps) {
    super(props);
    this.state = {
      suggestions: [],
    };
    this.searchContactVM = new SearchContactVM();
  }

  handleInputChange = (value: string) => {
    let members: ISelectedMember[] = [];
    this.searchContactVM.fetchSearch(value).then((data: Person[]) => {
      console.log('------data----', data);
      members = data.map(member => ({
        id: member.id,
        label: getName(member),
        email: member.email,
      }));
      // console.log('------members----', members);
      this.setState({ suggestions: members });
    });
  }
  render() {
    const { onChange, label, placeholder, error, helperText } = this.props;
    const { suggestions } = this.state;
    return (
      <JuiDownshiftMultiple
        inputChange={this.handleInputChange}
        suggestions={suggestions}
        onChange={onChange}
        label={label}
        placeholder={placeholder}
        Chip={Chip}
        SearchContactItem={SearchContactItem}
        error={error}
        helperText={helperText}
      />
    );
  }
}

export default translate('translations')(SearchContact);
