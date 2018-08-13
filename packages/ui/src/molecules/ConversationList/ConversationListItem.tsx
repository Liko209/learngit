import React from 'react';
import styled from 'styled-components';

import {
  WithTheme,
  ListItem as MuiListItem,
} from '@material-ui/core';
import {
  MoreVert as MuiMoreVert,
} from '@material-ui/icons';

import { Presence, Umi } from '../../atoms';
import { ItemText } from './ItemText';

const MoreVert = styled(MuiMoreVert)`
color: #c7c7c7;
`;

const ListItem = styled(MuiListItem)`
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

&& ${MoreVert} {
  opacity: 0;
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
}

&&:hover ${MoreVert} {
  opacity: 1;
}
`;

export type ItemProps = {
  title: string;
  status?: string;
  unreadCount?: number;
  showCount?: boolean;
  important?: boolean;
  onClick?: (e: React.MouseEvent) => any;
  onMoreClick?: (e: React.MouseEvent) => any;
} & Partial<Pick<WithTheme, 'theme'>>;

const TItem = (props: ItemProps) => {
  const { title, status, unreadCount, important, showCount, onClick, onMoreClick } = props;
  const fontWeight = unreadCount ? 'bold' : 'normal';

  return (
    <ListItem button={true} onClick={onClick}>
      <Presence status={status} />
      <ItemText style={{ fontWeight }}>
        {title}
      </ItemText>
      <Umi important={important} unreadCount={unreadCount} showCount={!showCount} />
      <MoreVert onClick={onMoreClick} />
    </ListItem>
  );
};

export const ConversationListItem = styled<ItemProps>(TItem)`
`;

export default ConversationListItem;
