/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 14:31:01
 * Copyright © RingCentral. All rights reserved.
 */
import React, { createRef } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiDownshift } from 'jui/components/Downshift';

import { Chip } from '@/containers/Chip';
import { GroupSearchItem } from './GroupSearchItem';

import { ViewProps } from './types';

type Props = WithTranslation & ViewProps;

@observer
class GroupSearch extends React.Component<Props> {
  inputRef = createRef<HTMLInputElement>();

  componentDidMount() {
    const node = this.inputRef.current;
    const { autoFocusInput } = this.props;
    if (node && autoFocusInput) {
      node.focus();
    }
  }

  render() {
    const {
      handleSelectChange,
      label,
      placeholder,
      searchGroups,
      suggestions,
      multiple,
      maxLength,
      inputValue,
      selectedItems,
    } = this.props;

    return (
      <JuiDownshift
        inputValue={inputValue}
        selectedItems={selectedItems}
        onInputChange={searchGroups}
        suggestionItems={suggestions}
        onSelectChange={handleSelectChange}
        inputLabel={label}
        inputPlaceholder={placeholder}
        InputItem={Chip}
        MenuItem={GroupSearchItem}
        automationId="GroupSearchGroupSuggestionsList"
        messageRef={this.inputRef}
        minRowHeight={44}
        multiple={multiple}
        maxLength={maxLength}
      />
    );
  }
}

const GroupSearchView = withTranslation('translations')(GroupSearch);

export { GroupSearchView };
