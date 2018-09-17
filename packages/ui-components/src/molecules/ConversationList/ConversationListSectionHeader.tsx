/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:34:57
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import MuiListItem from '@material-ui/core/ListItem';

import styled from '../../styled-components';
import { spacing, grey } from '../../utils';
import { Umi, Icon } from '../../atoms';
import { ConversationListItemText as ItemText } from './ConversationListItemText';

const StyledListItem = styled(MuiListItem)`
  && {
    padding: ${spacing(2, 4, 2, 3)};
    background: white;
    color: ${grey('700')};
  }

  && > ${Icon} {
    color: ${grey('400')};
  }
`;

type SectionHeaderProps = {
  title: string;
  unreadCount?: number;
  icon: JSX.Element;
  important?: boolean;
  umiVariant?: 'count' | 'dot' | 'auto';
  expanded?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => any;
  onArrowClick?: (e: React.MouseEvent) => any;
};

const ConversationListSectionHeader = (props: SectionHeaderProps) => {
  const {
    icon,
    title,
    unreadCount,
    important,
    expanded,
    umiVariant,
    className,
    onClick,
    onArrowClick,
  } = props;

  const arrow = expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down';

  return (
    <StyledListItem className={className} button={true} onClick={onClick}>
      {icon}
      <ItemText>{title}</ItemText>
      {!expanded ? (
        <Umi
          variant={umiVariant}
          important={important}
          unreadCount={unreadCount}
        />
      ) : null}
      <Icon onClick={onArrowClick}>{arrow}</Icon>
    </StyledListItem>
  );
};

export default ConversationListSectionHeader;
export { ConversationListSectionHeader, SectionHeaderProps };
