/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 14:31:01
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiContactSearch } from 'jui/pattern/ContactSearch';

import { Chip } from '@/containers/Chip';
import { ContactSearchItem } from './ContactSearchItem';

import { ViewProps } from './types';

type Props = WithTranslation & ViewProps;

class ContactSearch extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const {
      onContactSelectChange,
      label,
      placeholder,
      error,
      helperText,
      searchMembers,
      suggestions,
      errorEmail,
      messageRef,
    } = this.props;

    return (
      <JuiContactSearch
        inputChange={searchMembers}
        suggestions={suggestions}
        onSelectChange={onContactSelectChange}
        label={label}
        placeholder={placeholder}
        Chip={Chip}
        ContactSearchItem={ContactSearchItem}
        error={error}
        errorEmail={errorEmail}
        helperText={helperText}
        automationId="contactSearchSuggestionsList"
        messageRef={messageRef}
      />
    );
  }
}

const ContactSearchView = withTranslation('translations')(ContactSearch);

export { ContactSearchView };
