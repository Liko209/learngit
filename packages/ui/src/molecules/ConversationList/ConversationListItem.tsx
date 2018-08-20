/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:34:48
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../styled-components';

import MuiMenuItem, { MenuItemProps as MuiMenuItemProps } from '@material-ui/core/MenuItem';

import { Presence, Umi, Icon } from '../../atoms';
import { ConversationListItemText as ItemText } from './ConversationListItemText';

const StyledListItem = styled(MuiMenuItem)`
&& {
  white-space: nowrap;
  padding: 6px 16px 6px 12px;
  background: white;
  color: #212121;
  /**
   * Workaround to resolve transition conflicts with react-sortable-hoc
   * Details at https://github.com/clauderic/react-sortable-hoc/issues/334
   */
  transition: transform 0s ease, background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
}

&&:hover {
  background: #f8f8f8;
}

&&:focus {
  background: #e0e0e0;
}

&& ${Icon} {
  opacity: 0;
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
}

&&:hover ${Icon} {
  opacity: 1;
}
`;

type ListItemProps = {
  title: string;
  status?: string;
  unreadCount?: number;
  important?: boolean;
  umiVariant?: 'count' | 'dot' | 'auto';
  onClick?: (e: React.MouseEvent) => any;
  onMoreClick?: (e: React.MouseEvent) => any;
} & MuiMenuItemProps;

const ConversationListItem = (props: ListItemProps) => {
  const { title, status, unreadCount, important, onClick, onMoreClick, umiVariant } = props;
  const fontWeight = unreadCount ? 'bold' : 'normal';

  return (
    <StyledListItem
      button={true}
      onClick={onClick}
    >
      <Presence status={status} />
      <ItemText style={{ fontWeight }}>{title}</ItemText>
      <Umi variant={umiVariant} important={important} unreadCount={unreadCount} />
      <Icon onClick={onMoreClick}>more_vert</Icon>
    </StyledListItem>
  );
};

export default ConversationListItem;
export { ListItemProps, ConversationListItem };
