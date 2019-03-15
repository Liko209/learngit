/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:34:57
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';

import MuiListItem from '@material-ui/core/ListItem';

import styled, { keyframes } from '../../foundation/styled-components';
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
import { fade } from '@material-ui/core/styles/colorManipulator';
const rippleEnter = (theme: Theme) => keyframes`
  from {
    transform: scale(0);
    opacity: 0.1;
  }
  to {
    transform: scale(1);
    opacity: ${1 - theme.palette.action.hoverOpacity};
  }
`;
const touchRippleClasses = {
  child: 'child',
  rippleVisible: 'rippleVisible',
};
const StyledRightWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.elementOnRipple};
`;
const StyledJuiIconographyLeft = styled(JuiIconography)``;
const StyledJuiIconography = styled(JuiIconography)``;

const StyledListItem = styled(MuiListItem)`
  && {
    padding: ${spacing(2, 4, 2, 3)};
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
    background-color: ${({ theme }) =>
      fade(palette('grey', '700')({ theme }), theme.opacity.p05)};
  }

  &&.selected {
    &&:hover {
      background-color: ${({ theme }) =>
        fade(palette('grey', '700')({ theme }), theme.opacity.p10)};
    }

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
    z-index: ${({ theme }) => theme.zIndex.elementOnRipple};
  }

  && > ${StyledJuiIconography} {
    color: ${grey('400')};
    font-size: 20px;
    margin-bottom: -1px;
  }

  .child {
    color: ${palette('action', 'active')};
    opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
  }

  .rippleVisible {
    color: ${({ theme }) => palette('action', 'active')({ theme })};
    opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
    transform: scale(1);
    animation-name: ${({ theme }) => rippleEnter(theme)};
    z-index: ${({ theme }) => theme.zIndex.ripple};
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

const JuiConversationListSectionHeader = memo(
  (props: JuiSectionHeaderProps) => {
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
      ...rest
    } = props;

    const arrow = expanded ? 'arrow_up' : 'arrow_down';

    return (
      <StyledListItem
        className={className}
        data-test-automation-id="conversation-list-section-header"
        button={true}
        selected={selected}
        classes={{ selected: 'selected' }}
        TouchRippleProps={{ classes: touchRippleClasses }}
        onClick={onClick}
        {...rest}
      >
        <StyledJuiIconographyLeft>{icon}</StyledJuiIconographyLeft>
        <ItemText disableTooltip={true}>{title}</ItemText>
        <StyledRightWrapper>
          {!expanded ? umi : null}
          {!hideArrow ? (
            <StyledJuiIconography onClick={onArrowClick}>
              {arrow}
            </StyledJuiIconography>
          ) : null}
        </StyledRightWrapper>
      </StyledListItem>
    );
  },
);

export default JuiConversationListSectionHeader;
export { JuiConversationListSectionHeader, JuiSectionHeaderProps };
