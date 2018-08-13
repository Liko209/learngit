import React from 'react';
import styled from 'styled-components';

import {
  WithTheme,
  ListItem as MuiMenuItem,
} from '@material-ui/core';
import {
  KeyboardArrowUp as MuiKeyboardArrowUp,
  KeyboardArrowDown as MuiKeyboardArrowDown,
} from '@material-ui/icons';

import { Umi } from '../../atoms';
import { ItemText } from './ItemText';

const KeyboardArrowUp = styled(MuiKeyboardArrowUp)`
color: #c7c7c7;
`;
const KeyboardArrowDown = styled(MuiKeyboardArrowDown)`
color: #c7c7c7;
`;

export type SectionHeaderProps = {
  title: string;
  unreadCount?: number;
  icon: JSX.Element;
  showCount?: boolean;
  important?: boolean;
  expanded?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => any;
  onMoreClick?: (e: React.MouseEvent) => any;
} & Partial<Pick<WithTheme, 'theme'>>;

const TSectionHeader = (props: SectionHeaderProps) => {
  const { icon, title, unreadCount, important, expanded,
    showCount, className, onClick, onMoreClick } = props;

  const arrow = expanded ?
    <KeyboardArrowUp onClick={onMoreClick} /> :
    <KeyboardArrowDown onClick={onMoreClick} />;

  return (
    <MuiMenuItem className={className} button={true} onClick={onClick}>
      {icon}
      <ItemText>
        {title}
      </ItemText>
      <Umi important={important} unreadCount={unreadCount} showCount={!showCount} />
      {arrow}
    </MuiMenuItem>
  );
};

export const ConversationListSectionHeader = styled<SectionHeaderProps>(TSectionHeader)`
  && {
    padding: 8px 16px 8px 12px;
    background: white;
  }
`;

export default ConversationListSectionHeader;
