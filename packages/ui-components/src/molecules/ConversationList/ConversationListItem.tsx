/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:34:48
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import MuiMenuItem, {
  MenuItemProps as MuiMenuItemProps,
} from '@material-ui/core/MenuItem';

import styled from '../../styled-components';
import { spacing, grey } from '../../utils';
import { Presence, Umi, Icon, PresenceProps } from '../../atoms';
import { ConversationListItemText as ItemText } from './ConversationListItemText';

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

  &&:hover {
    background: ${grey('100')};
  }

  &&:focus {
    background: ${grey('300')};
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
  status?: PresenceProps['presence'];
  unreadCount?: number;
  important?: boolean;
  umiHint?: boolean;
  umiVariant?: 'count' | 'dot' | 'auto';
  onClick?: (e: React.MouseEvent) => any;
  onMoreClick?: (e: React.MouseEvent) => any;
} & MuiMenuItemProps;

type IConversationListItem = {
  dependencies?: React.ComponentType[];
} & React.SFC<ListItemProps>;

const ConversationListItem: IConversationListItem = (props: ListItemProps) => {
  const {
    title,
    status,
    unreadCount,
    important,
    onClick,
    onMoreClick,
    umiVariant,
    component,
    selected,
    umiHint,
  } = props;

  const fontWeight = umiHint ? 'bold' : 'normal';

  return (
    <StyledListItem onClick={onClick} component={component} selected={selected}>
      <Presence presence={status} />
      <ItemText style={{ fontWeight }}>{title}</ItemText>
      <Umi
        variant={umiVariant}
        important={important}
        unreadCount={unreadCount}
      />
      <Icon onClick={onMoreClick}>more_vert</Icon>
    </StyledListItem>
  );
};

ConversationListItem.dependencies = [ItemText, Presence, Umi, Icon];

export default ConversationListItem;
export { ListItemProps, ConversationListItem };
