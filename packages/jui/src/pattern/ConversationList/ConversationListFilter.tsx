/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-23 12:31:45
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';

import MuiMenuItem from '@material-ui/core/MenuItem';

import styled from '../../foundation/styled-components';
import { spacing, grey, height } from '../../foundation/utils';
import { ConversationListItemText as ItemText } from './ConversationListItemText';
import {
  JuiToggleButton,
  JuiToggleButtonProps,
} from '../../components/Buttons/ToggleButton';

const StyledListItem = styled(MuiMenuItem)`
  && {
    white-space: nowrap;
    padding: ${spacing(0, 3, 0, 3)};
    height: ${height(14)};
    line-height: ${height(14)};
    color: ${grey('900')};
    &:hover {
      background-color: inherit;
      cursor: initial;
    }
  }
`;

const StyledItemText = styled(ItemText)`
  && {
    font-size: ${spacing(3)};
    color: ${({ theme }) => theme.palette.grey['900']};
    font-weight: ${({ theme }) => theme.typography.subheading3.fontWeight};
  }
`;

type JuiConversationListFilterProps = {
  label: string;
} & JuiToggleButtonProps;

type IConversationListItem = {
  dependencies?: React.ComponentType[];
} & React.SFC<JuiConversationListFilterProps>;

const JuiConversationListFilter: IConversationListItem = memo(
  (props: JuiConversationListFilterProps) => {
    const { label, checked, onChange, disabled, ...rest } = props;

    return (
      <StyledListItem
        classes={{ selected: 'selected' }}
        disableRipple
        {...rest}
      >
        <StyledItemText>{label}</StyledItemText>
        <JuiToggleButton
          className="toggle-button"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      </StyledListItem>
    );
  },
);

JuiConversationListFilter.dependencies = [StyledItemText];

export default JuiConversationListFilter;
export { JuiConversationListFilterProps, JuiConversationListFilter };
