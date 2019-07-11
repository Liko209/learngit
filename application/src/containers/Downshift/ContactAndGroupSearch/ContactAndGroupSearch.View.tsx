/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-07-09 14:07:21
 * Copyright © RingCentral. All rights reserved.
 */
import React, { createRef } from 'react';
import { observer } from 'mobx-react';
import {
  JuiDownshift,
  JuiDownshiftKeyDownEvent,
} from 'jui/components/Downshift';

import { Chip } from '@/containers/Chip';

import { ViewProps, ContactAndGroupSearchItemViewProps } from './types';
import { ContactSearchItem } from '../ContactSearch/ContactSearchItem';
import { GroupSearchItem } from '../GroupSearch/GroupSearchItem';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

@observer
class ContactAndGroupSearchItem extends React.Component<ContactAndGroupSearchItemViewProps> {
  render() {
    const { itemId } = this.props;
    return GlipTypeUtil.isExpectedType(
      itemId,
      TypeDictionary.TYPE_ID_PERSON,
    ) ? (
        <ContactSearchItem {...this.props} />
      ) : (
        <GroupSearchItem {...this.props} />
      );
  }
}

@observer
class ContactAndGroupSearchView extends React.Component<ViewProps> {
  inputRef = createRef<HTMLInputElement>();

  onKeyDown = (event: JuiDownshiftKeyDownEvent) => {
    if (event.key === 'Escape') {
      event.nativeEvent.preventDownshiftDefault = true;
    }
  };

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
      multiple,
      autoSwitchEmail,
      maxLength,
      inputValue,
      selectedItems,
      autoFocus,
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
        MenuItem={ContactAndGroupSearchItem}
        nameError={error}
        emailError={errorEmail}
        helperText={helperText}
        automationId={'contactSearchSuggestionsList'}
        messageRef={this.inputRef}
        minRowHeight={44}
        multiple={multiple}
        autoSwitchEmail={autoSwitchEmail}
        maxLength={maxLength}
        onKeyDown={this.onKeyDown}
        autoFocus={autoFocus}
      />
    );
  }
}

export { ContactAndGroupSearchView };
