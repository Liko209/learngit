/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:34:57
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import MuiListItem from '@material-ui/core/ListItem';

import styled from '../../foundation/styled-components';
import { spacing, grey } from '../../foundation/utils';
import { JuiIconography } from '../../foundation/Iconography';
import { ConversationListItemText as ItemText } from './ConversationListItemText';

const StyledJuiIconography = styled(JuiIconography)``;

const StyledListItem = styled(MuiListItem)`
  && {
    padding: ${spacing(2, 4, 2, 3)};
    background: white;
    color: ${grey('700')};
  }

  && > ${StyledJuiIconography} {
    color: ${grey('400')};
  }
`;

type SectionHeaderProps = {
  title: string;
  icon: JSX.Element;
  umi: JSX.Element;
  expanded?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => any;
  onArrowClick?: (e: React.MouseEvent) => any;
};

const ConversationListSectionHeader = (props: SectionHeaderProps) => {
  const {
    icon,
    title,
    umi,
    expanded,
    className,
    onClick,
    onArrowClick,
  } = props;

  const arrow = expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down';

  return (
    <StyledListItem className={className} button={true} onClick={onClick}>
      {icon}
      <ItemText>{title}</ItemText>
      {!expanded ? umi : null}
      <StyledJuiIconography onClick={onArrowClick}>
        {arrow}
      </StyledJuiIconography>
    </StyledListItem>
  );
};

export default ConversationListSectionHeader;
export { ConversationListSectionHeader, SectionHeaderProps };
