import React from 'react';
import styled from 'styled-components';

import {
  WithTheme,
  ListItem as MuiListItem,
} from '@material-ui/core';

import { Umi, Icon } from '../../atoms';
import { ConversationListItemText as ItemText } from './ConversationListItemText';

const StyledListItem = styled(MuiListItem)`
  && {
    padding: 8px 16px 8px 12px;
    background: white;
  }
`;

type SectionHeaderProps = {
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

const ConversationListSectionHeader = (props: SectionHeaderProps) => {
  const { icon, title, unreadCount, important, expanded,
    showCount, className, onClick, onArrowClick } = props;

  const arrow = expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down';

  return (
    <StyledListItem className={className} button={true} onClick={onClick}>
      {icon}
      <ItemText>{title}</ItemText>
      <Umi important={important} unreadCount={unreadCount} showCount={showCount} />
      <Icon onClick={onArrowClick}>{arrow}</Icon>
    </StyledListItem>
  );
};

export default ConversationListSectionHeader;
export { ConversationListSectionHeader, SectionHeaderProps };
