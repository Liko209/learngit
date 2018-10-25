/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-23 12:31:45
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import MuiMenuItem from '@material-ui/core/MenuItem';

import styled from '../../foundation/styled-components';
import { spacing, grey, typography } from '../../foundation/utils';
import { ConversationListItemText as ItemText } from './ConversationListItemText';
import {
  JuiToggleButton,
  JuiToggleButtonProps,
} from './../../components/Buttons/ToggleButton';

const StyledListItem = styled(MuiMenuItem)`
  && {
    white-space: nowrap;
    background: white;
    padding: ${spacing(4, 4, 4, 8)};
    color: ${grey('900')};
    ${typography('body2')};
    &:hover {
      background: white;
      cursor: initial;
    }
  }
`;

type JuiConversationListFilterProps = {
  label: string;
} & JuiToggleButtonProps;

type IConversationListItem = {
  dependencies?: React.ComponentType[];
} & React.SFC<JuiConversationListFilterProps>;

const JuiConversationListFilter: IConversationListItem = (
  props: JuiConversationListFilterProps,
) => {
  const { label, checked, onChange, disabled, ...rest } = props;

  return (
    <StyledListItem
      classes={{ selected: 'selected' }}
      disableRipple={true}
      {...rest}
    >
      <ItemText>{label}</ItemText>
      <JuiToggleButton
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </StyledListItem>
  );
};

JuiConversationListFilter.dependencies = [ItemText];

export default JuiConversationListFilter;
export { JuiConversationListFilterProps, JuiConversationListFilter };
