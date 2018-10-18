/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:34:48
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import MuiMenuItem, {
  MenuItemProps as MuiMenuItemProps,
} from '@material-ui/core/MenuItem';

import styled from '../../foundation/styled-components';
import { spacing, grey, palette } from '../../foundation/utils';
import { JuiIconography } from '../../foundation/Iconography';
import { ConversationListItemText as ItemText } from './ConversationListItemText';

const StyledIconography = styled(JuiIconography)``;

const StyledListItem = styled(MuiMenuItem)`
  && {
    white-space: nowrap;
    background: white;
    padding: ${spacing(2, 4, 2, 3)};
    color: ${grey('900')};
    /**
     * Workaround to resolve transition conflicts with react-sortable-hoc
     * Details at https://github.com/clauderic/react-sortable-hoc/issues/334
     */
    transition: transform 0s ease,
      background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  }

  &&:active {
    background: ${palette('primary', '50')};
  }

  &&:active p {
    color: ${palette('primary', 'main')};
  }

  &&:hover {
    background-color: ${({ theme, selected }) =>
      selected ? theme.palette.action.active : grey('50')};
  }

  && ${StyledIconography} {
    opacity: 0;
    transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  }

  &&:hover ${StyledIconography} {
    opacity: 1;
  }
  &&.selected {
    background: ${grey('300')};
  }
  &&.selected p {
    color: ${palette('primary', 'main')};
  }
`;

type JuiConversationListItemProps = {
  title: string;
  presence?: JSX.Element;
  umi?: JSX.Element;
  indicator: JSX.Element | null;
  fontWeight?: 'bold' | 'normal';
  onClick?: (e: React.MouseEvent) => any;
  onMoreClick?: (e: React.MouseEvent) => any;
  umiHint?: boolean;
} & MuiMenuItemProps;

type IConversationListItem = {
  dependencies?: React.ComponentType[];
} & React.SFC<JuiConversationListItemProps>;

const JuiConversationListItem: IConversationListItem = (
  props: JuiConversationListItemProps,
) => {
  const {
    title,
    indicator,
    presence,
    umi,
    onClick,
    onMoreClick,
    component,
    selected,
    innerRef,
    umiHint,
    ...rest
  } = props;

  const fontWeight = umiHint ? 'bold' : 'normal';
  return (
    <StyledListItem
      onClick={onClick}
      component={component}
      selected={selected}
      classes={{ selected: 'selected' }}
      {...rest}
    >
      {presence}
      <ItemText style={{ fontWeight }}>
        {indicator} {title}
      </ItemText>
      {umi}
      <StyledIconography onClick={onMoreClick}>more_vert</StyledIconography>
    </StyledListItem>
  );
};

JuiConversationListItem.dependencies = [ItemText, JuiIconography];

export default JuiConversationListItem;
export { JuiConversationListItemProps, JuiConversationListItem };
