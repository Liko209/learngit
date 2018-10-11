/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 14:31:01
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { translate } from 'react-i18next';
import { TranslationFunction, i18n } from 'i18next';
import { JuiContactSearch } from 'jui/pattern/ContactSearch';

import { Chip } from '@/containers/Chip';
import { ContactSearchItem } from './ContactSearchItem';
import { getName } from '../../utils/getName';
import { Person } from 'sdk/src/models';
import { ViewProps } from './types';

type Props = {
  i18n: i18n;
  t: TranslationFunction;
} & ViewProps;

interface ISelectedMember {
  id: number;
  label: string;
  email: string;
}

interface IStates {
  suggestions: ISelectedMember[];
}

class ContactSearch extends React.Component<Props, IStates> {
  constructor(props: Props) {
    super(props);
    this.state = {
      suggestions: [],
    };
  }

  handleInputChange = (value: string) => {
    const { fetchSearch } = this.props;
    let members: ISelectedMember[] = [];
    fetchSearch(value).then((data: Person[]) => {
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
      <JuiContactSearch
        inputChange={this.handleInputChange}
        suggestions={suggestions}
        onChange={onChange}
        label={label}
        placeholder={placeholder}
        Chip={Chip}
        SearchContactItem={ContactSearchItem}
        error={error}
        helperText={helperText}
      />
    );
  }
}

const ContactSearchView = translate('translations')(ContactSearch);

export { ContactSearchView };
