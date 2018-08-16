import React from 'react';
import styled from 'styled-components';

import {
  WithTheme,
  ListItem as MuiMenuItem,
} from '@material-ui/core';

import { Umi, Icon } from '../../atoms';
import { ConversationListItemText as ItemText } from './ConversationListItemText';

export type SectionHeaderProps = {
  title: string;
  unreadCount?: number;
  icon: JSX.Element;
  showCount?: boolean;
  important?: boolean;
  expanded?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => any;
  onArrowClick?: (e: React.MouseEvent) => any;
} & Partial<Pick<WithTheme, 'theme'>>;

const TSectionHeader = (props: SectionHeaderProps) => {
  const { icon, title, unreadCount, important, expanded,
    showCount, className, onClick, onArrowClick } = props;

  const arrow = expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down';

  return (
    <MuiMenuItem className={className} button={true} onClick={onClick}>
      {icon}
      <ItemText>{title}</ItemText>
      <Umi important={important} unreadCount={unreadCount} showCount={showCount} />
      <Icon onClick={onArrowClick}>{arrow}</Icon>
    </MuiMenuItem>
  );
};

const ConversationListSectionHeader = styled<SectionHeaderProps>(TSectionHeader)`
  && {
    padding: 8px 16px 8px 12px;
    background: white;
  }
`;

export default ConversationListSectionHeader;
export { TSectionHeader, ConversationListSectionHeader };
