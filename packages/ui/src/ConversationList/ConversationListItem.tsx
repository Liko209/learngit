import React from 'react';
import styled from 'styled-components';

import { WithTheme } from '@material-ui/core';
import MuiMenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import MuiMoreVert from '@material-ui/icons/MoreVert';

import { Presence } from './Presence';
import { Umi } from './Umi';

const MoreVert = styled(MuiMoreVert)``;

const ItemText = styled(Typography)`
  flex: 1;
  padding: 0 8px;
  font-size: 14px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MenuItem = styled(MuiMenuItem)`
  && {
    background: white;
    padding: 6px 16px 6px 12px;
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

export type ConversationListItemProps = {
  title: string;
  status?: string;
  unreadCount?: number;
  team?: boolean;
  important?: boolean;
  onClick?: () => any;
} & Partial<Pick<WithTheme, 'theme'>>;

const TConversationListItem = (props: ConversationListItemProps) => {
  const { title, status, unreadCount, important, team } = props;
  return (
    <MenuItem button={true} onClick={props.onClick}>
      <Presence status={status} />
      <ItemText style={{ fontWeight: !!unreadCount ? 'bold' : 'normal' }}>
        {title}
      </ItemText>
      <Umi important={important} unreadCount={unreadCount} showNumber={!team} />
      <MoreVert style={{ color: '#c7c7c7' }} />
    </MenuItem>
  );
};

export const ConversationListItem = styled<ConversationListItemProps>(TConversationListItem)`
    padding-left: 12px;
    padding-right: 16px;
  `;

export default ConversationListItem;
