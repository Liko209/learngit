import React, { Component } from 'react';
import styled from 'styled-components';

import { WithTheme } from '@material-ui/core/styles/withTheme';
import { ListItem as MuiListItem } from '@material-ui/core';

import { Presence, Umi, Icon } from '../../atoms';
import { ConversationListItemText as ItemText } from './ConversationListItemText';

const StyledListItem = styled(MuiListItem)`
&& {
  white-space: nowrap;
  padding: 6px 16px 6px 12px;
  background: white;
  color: #212121;
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

type ItemProps = {
  title: string;
  status?: string;
  unreadCount?: number;
  showCount?: boolean;
  important?: boolean;
  onClick?: (e: React.MouseEvent) => any;
  onMoreClick?: (e: React.MouseEvent) => any;
} & Partial<Pick<WithTheme, 'theme'>>;

class ConversationListItem extends Component<ItemProps> {

  render() {
    const { title, status, unreadCount, important,
      showCount, onClick, onMoreClick } = this.props;

    const fontWeight = unreadCount ? 'bold' : 'normal';
    return (
      <StyledListItem
        button={true}
        onClick={onClick}
      >
        <Presence status={status} />
        <ItemText style={{ fontWeight }}>{title}</ItemText>
        <Umi important={important} unreadCount={unreadCount} showCount={showCount} />
        <Icon onClick={onMoreClick}>more_vert</Icon>
      </StyledListItem>
    );
  }
}

export default ConversationListItem;
export { ItemProps, ConversationListItem };
