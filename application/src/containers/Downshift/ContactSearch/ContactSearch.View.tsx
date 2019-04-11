/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 14:31:01
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { JuiDownshift } from 'jui/components/Downshift';

import { Chip } from '@/containers/Chip';
import { ContactSearchItem } from './ContactSearchItem';

import { ViewProps } from './types';

@observer
class ContactSearchView extends React.Component<ViewProps> {
  render() {
    const {
      handleSelectChange,
      label,
      placeholder,
      error,
      helperText,
      searchMembers,
      suggestions,
      errorEmail,
      messageRef,
      multiple,
      autoSwitchEmail,
      maxLength,
      inputValue,
      selectedItems,
    } = this.props;

    return (
      <JuiDownshift
        inputValue={inputValue}
        selectedItems={selectedItems}
        onInputChange={searchMembers}
        suggestionItems={suggestions}
        onSelectChange={handleSelectChange}
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
        maxLength={maxLength}
      />
    );
  }
}

export { ContactSearchView };
