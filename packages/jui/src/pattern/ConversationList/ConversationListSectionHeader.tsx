/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:34:57
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import MuiListItem from '@material-ui/core/ListItem';

import styled from '../../foundation/styled-components';
import {
  spacing,
  grey,
  height,
  typography,
  palette,
} from '../../foundation/utils';
import { JuiIconography } from '../../foundation/Iconography';
import { ConversationListItemText as ItemText } from './ConversationListItemText';
import tinycolor from 'tinycolor2';
import { Theme } from '../../foundation/theme/theme';

const StyledJuiIconographyLeft = styled(JuiIconography)``;
const StyledJuiIconography = styled(JuiIconography)``;

const StyledListItem = styled(MuiListItem)`
  && {
    padding: ${spacing(2, 4, 2, 3)};
    background: white;
    color: ${grey('900')};
    height: ${height(11)};
    line-height: ${height(11)};
    ${typography('body2')};
  }

  &&:active {
    color: ${palette('primary', 'main')};
    background: ${palette('primary', '50')};
  }

  &&:hover {
    background-color: ${grey('50')};
  }

  &&.selected {
    background: white;

    p {
      color: ${palette('primary', 'main')};
    }

    > ${StyledJuiIconographyLeft} {
      color: ${palette('primary', 'main')};
    }
  }

  && > ${StyledJuiIconographyLeft} {
    font-size: 20px;
    color: ${({ theme }: { theme: Theme }) =>
      tinycolor(grey('600')({ theme }))
        .setAlpha(0.4)
        .toRgbString()};
  }

  && > ${StyledJuiIconography} {
    color: ${grey('400')};
    font-size: 20px;
    margin-bottom: -1px;
  }
`;

type JuiSectionHeaderProps = {
  title: string;
  icon: string;
  umi?: JSX.Element;
  expanded?: boolean;
  className?: string;
  hideArrow?: boolean;
  selected?: boolean;
  onClick?: (e: React.MouseEvent) => any;
  onArrowClick?: (e: React.MouseEvent) => any;
};

const JuiConversationListSectionHeader = (props: JuiSectionHeaderProps) => {
  const {
    icon,
    title,
    umi,
    expanded,
    className,
    hideArrow,
    onClick,
    onArrowClick,
    selected,
  } = props;

  const arrow = expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down';

  return (
    <StyledListItem
      className={className}
      data-test-automation-id="conversation-list-section-header"
      button={true}
      selected={selected}
      classes={{ selected: 'selected' }}
      onClick={onClick}
    >
      <StyledJuiIconographyLeft>{icon}</StyledJuiIconographyLeft>
      <ItemText>{title}</ItemText>
      {!expanded ? umi : null}
      {!hideArrow ? (
        <StyledJuiIconography onClick={onArrowClick}>
          {arrow}
        </StyledJuiIconography>
      ) : null}
    </StyledListItem>
  );
};

export default JuiConversationListSectionHeader;
export { JuiConversationListSectionHeader, JuiSectionHeaderProps };
