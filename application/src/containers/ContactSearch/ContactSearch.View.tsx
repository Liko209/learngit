/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 14:31:01
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiDownshift } from 'jui/components/Downshift';

import { Chip } from '@/containers/Chip';
import { ContactSearchItem } from './ContactSearchItem';
import { GroupSearchItem } from './GroupSearchItem';

import { ViewProps, ContactSearchType } from './types';

type Props = WithTranslation & ViewProps;

@observer
class ContactSearch extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const {
      type,
      onContactSelectChange,
      label,
      placeholder,
      error,
      helperText,
      searchMembers,
      searchGroups,
      suggestions,
      errorEmail,
      messageRef,
      multiple,
      autoSwitchEmail,
    } = this.props;

    return type === ContactSearchType.PERSON ? (
      <JuiDownshift
        onInputChange={searchMembers}
        suggestionItems={suggestions}
        onSelectChange={onContactSelectChange}
        inputLabel={label}
        inputPlaceholder={placeholder}
        InputItem={Chip}
        MenuItem={ContactSearchItem}
        nameError={error}
        emailError={errorEmail}
        helperText={helperText}
        automationId="contactSearchSuggestionsList"
        messageRef={messageRef}
        minRowHeight={44}
        multiple={multiple}
        autoSwitchEmail={autoSwitchEmail}
      />
    ) : (
      <JuiDownshift
        onInputChange={searchGroups}
        suggestionItems={suggestions}
        onSelectChange={onContactSelectChange}
        inputLabel={label}
        inputPlaceholder={placeholder}
        MenuItem={GroupSearchItem}
        nameError={error}
        emailError={errorEmail}
        helperText={helperText}
        automationId="contactSearchSuggestionsList"
        messageRef={messageRef}
        minRowHeight={44}
        multiple={multiple}
        autoSwitchEmail={autoSwitchEmail}
      />
    );
  }
}

const ContactSearchView = withTranslation('translations')(ContactSearch);

export { ContactSearchView };
