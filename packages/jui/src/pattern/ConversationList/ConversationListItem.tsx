/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:34:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';

import MuiMenuItem, {
  MenuItemProps as MuiMenuItemProps,
} from '@material-ui/core/MenuItem';
import { JuiMenu } from '../../components';
import styled, { keyframes, css } from '../../foundation/styled-components';
import { fade } from '@material-ui/core/styles/colorManipulator';
import {
  spacing, grey, palette, width, height,
} from '../../foundation/utils';
import { JuiIconography } from '../../foundation/Iconography';
import { ConversationListItemText as ItemText } from './ConversationListItemText';
import { StyledIconographyDraft, StyledIconographyFailure } from './Indicator';
import { Theme } from '../../foundation/theme/theme';
import { JuiIconButton, JuiIconButtonProps } from '../../components/Buttons';

// can't get component and touchRippleClasses from MenuItemProps
type MuiMenuItemPropsExtend = MuiMenuItemProps & {
  component?: React.ElementType;
  TouchRippleProps?: any;
  isItemHover?: boolean;
  // type issue, so add button, https://github.com/mui-org/material-ui/issues/14971
  button?: any;
};

const StyledRightWrapper = styled.div`
  width: ${width(5)};
  height: ${height(5)};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.elementOnRipple};
  outline: none;
`;
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

const StyledIconButtonMore = styled(JuiIconButton)<JuiIconButtonProps>``;

const hoverStyle = css`
  background-color: ${({ theme }) => fade(grey('700')({ theme }), theme.opacity['1'] / 2)};
  ${StyledIconButtonMore} {
    display: inline-flex;
  }
  ${StyledIconographyDraft}, ${StyledIconographyFailure} {
    display: none;
  }
`;
const JuiMenuContain = styled(JuiMenu)`
  && {
    li {
      background: ${palette('common', 'white')};
    }
  }
`;

const FilteredComponent = ({
  isItemHover,
  ...rest
}: MuiMenuItemPropsExtend) => <MuiMenuItem {...rest} />;

const StyledListItem = styled<MuiMenuItemPropsExtend>(FilteredComponent)`
  && {
    white-space: nowrap;
    padding: ${spacing(0, 4, 0, 3)};
    height: ${height(8)};
    min-height: unset;
    line-height: ${height(8)};
    color: ${grey('900')};
    /**
     * Workaround to resolve transition conflicts with react-sortable-hoc
     * Details at https://github.com/clauderic/react-sortable-hoc/issues/334
     */
    transition: transform 0s ease,
      ${({ theme }) => theme.transitions.create('background-color', {
    duration: theme.transitions.duration.shortest,
    easing: theme.transitions.easing.easeInOut,
  })};
  }
  &&&& {
    ${({ isItemHover }) => (isItemHover ? hoverStyle : {})};
  }

  &&.dragging {
    z-index: ${({ theme }) => theme.zIndex.dragging};
  }

  &&:active p {
    color: ${palette('primary', 'main')};
  }

  && ${StyledIconButtonMore} {
    color: ${palette('grey', '400')};
    display: none;
    font-size: ${spacing(5)};
  }

  &&&:hover {
    ${hoverStyle}
  }

  &&.selected {
    background-color: ${({ theme }) => fade(grey('700')({ theme }), theme.opacity['1'])};
    p {
      color: ${palette('primary', 'main')};
    }
  }

  &&:last-child {
    margin-bottom: ${spacing(2)};
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
` as React.ComponentType<MuiMenuItemPropsExtend & { isItemHover?: boolean }>;

const StyledPresenceWrapper = styled.div`
  width: ${width(2)};
  height: ${height(2)};
  margin: ${spacing(1.5)};
  z-index: ${({ theme }) => theme.zIndex.elementOnRipple};
`;

type JuiConversationListItemProps = {
  title: string;
  presence?: JSX.Element | null;
  umi?: JSX.Element;
  indicator: JSX.Element | null;
  fontWeight?: 'bold' | 'normal';
  onClick?: (e: React.MouseEvent) => any;
  onMoreClick?: (e: React.MouseEvent) => any;
  umiHint?: boolean;
  hidden?: boolean;
  moreTooltipTitle: string;
} & MuiMenuItemPropsExtend;

type IConversationListItem = {
  dependencies?: React.ComponentType[];
} & React.SFC<JuiConversationListItemProps>;

const touchRippleClasses = {
  child: 'child',
  rippleVisible: 'rippleVisible',
};

const JuiConversationListItem: IConversationListItem = memo(
  (props: JuiConversationListItemProps) => {
    const {
      title,
      indicator,
      presence,
      umi,
      onClick,
      onMoreClick,
      component,
      selected,
      innerRef,
      umiHint,
      hidden,
      children,
      isItemHover,
      moreTooltipTitle,
      ...rest
    } = props;

    const fontWeight = umiHint ? 'bold' : 'normal';
    return hidden ? (
      <></>
    ) : (
      <StyledListItem
        onClick={onClick}
        component={component}
        selected={selected}
        classes={{ selected: 'selected' }}
        TouchRippleProps={{ classes: touchRippleClasses }}
        isItemHover={isItemHover}
        {...rest}
      >
        <StyledPresenceWrapper>{presence}</StyledPresenceWrapper>
        <ItemText style={{ fontWeight }}>{title}</ItemText>
        {umi}
        <StyledRightWrapper tabIndex={-1}>
          {indicator}
          <StyledIconButtonMore
            size="medium"
            variant="plain"
            data-test-automation-id="conversationListItemMoreButton"
            tooltipTitle={moreTooltipTitle}
            onClick={onMoreClick}
          >
            more_vert
          </StyledIconButtonMore>
        </StyledRightWrapper>
        {children}
      </StyledListItem>
    );
  },
);

JuiConversationListItem.dependencies = [ItemText, JuiIconography];

export default JuiConversationListItem;
export {
  JuiConversationListItemProps,
  JuiConversationListItem,
  JuiMenuContain,
};
