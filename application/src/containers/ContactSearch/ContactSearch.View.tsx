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

import { ViewProps } from './types';

type Props = {
  i18n: i18n;
  t: TranslationFunction;
} & ViewProps;

class ContactSearch extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const {
      onChange,
      label,
      placeholder,
      error,
      helperText,
      handleInputChange,
      suggestions,
    } = this.props;
    return (
      <JuiContactSearch
        inputChange={handleInputChange}
        suggestions={suggestions}
        onChange={onChange}
        label={label}
        placeholder={placeholder}
        Chip={Chip}
        ContactSearchItem={ContactSearchItem}
        error={error}
        helperText={helperText}
      />
    );
  }
}

const ContactSearchView = translate('translations')(ContactSearch);

export { ContactSearchView };
