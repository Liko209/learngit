/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:34:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import MuiMenuItem, {
  MenuItemProps as MuiMenuItemProps,
} from '@material-ui/core/MenuItem';
import { JuiMenu } from '../../components/Menus';
import styled, { keyframes, css } from '../../foundation/styled-components';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { spacing, grey, palette, width, height } from '../../foundation/utils';
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
  extraScrollPadding?: number;
};

type StyledMuiMenuItemProps = MuiMenuItemPropsExtend & { umi?: boolean };

const StyledRightWrapper = styled.div`
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
  background-color: ${({ theme }) =>
    fade(grey('700')({ theme }), theme.opacity['1'] / 2)};
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
  umi,
  extraScrollPadding,
  ...rest
}: StyledMuiMenuItemProps) => <MuiMenuItem {...rest} />;

const StyledItemText = styled(ItemText)`
  && {
    padding: 0;
  }
`;

const StyledListItem = styled<StyledMuiMenuItemProps>(FilteredComponent)`
  && {
    white-space: nowrap;
    padding: ${({ extraScrollPadding = 0 }) =>
      spacing(0, 3 + extraScrollPadding, 0, 3)};
    height: ${height(8)};
    min-height: unset;
    line-height: ${height(8)};

    /**
     * Workaround to resolve transition conflicts with react-sortable-hoc
     * Details at https://github.com/clauderic/react-sortable-hoc/issues/334
     */
    transition: transform 0s ease;
  }

  &&.MuiListItem-button:hover {
    background: unset;
  }

  &&.dragging {
    z-index: ${({ theme }) => theme.zIndex.dragging};
  }

  && ${StyledItemText} {
    color: ${({ theme, umi }) =>
      umi ? theme.palette.grey['900'] : theme.palette.grey['700']};
  }

  ${StyledIconButtonMore} {
    display: none;
  }

  &&&& {
    ${({ isItemHover }) => (isItemHover ? hoverStyle : {})};
  }

  &&&&.selected {
    background-color: ${palette('primary', 'main')};

    && ${StyledItemText} {
      color: ${({ theme }) => theme.palette.common.white};
    }

    && ${StyledIconButtonMore} {
      color: ${({ theme }) => theme.palette.common.white};
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
` as React.ComponentType<
  MuiMenuItemPropsExtend & { isItemHover?: boolean; umi?: boolean }
>;

const StyledPresenceWrapper = styled.div`
  width: ${width(2)};
  height: ${height(2)};
  margin-right: ${spacing(3)};
  z-index: ${({ theme }) => theme.zIndex.elementOnRipple};
`;

type JuiConversationListItemProps = {
  title: string;
  presence?: () => JSX.Element | null;
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

    const fontWeight = umiHint || selected ? 900 : 'normal';
    const IconButtonMoreColor = selected ? 'common.white' : 'grey.400';

    return hidden ? (
      <></>
    ) : (
      <StyledListItem
        onClick={onClick}
        component={component}
        selected={selected}
        umi={Boolean(umiHint)}
        classes={{ selected: 'selected' }}
        TouchRippleProps={{ classes: touchRippleClasses }}
        isItemHover={isItemHover}
        {...rest}
      >
        {presence && (
          <StyledPresenceWrapper>{presence()}</StyledPresenceWrapper>
        )}
        <StyledItemText style={{ fontWeight }}>{title}</StyledItemText>
        <StyledRightWrapper tabIndex={-1}>
          {indicator}
          <StyledIconButtonMore
            size="medium"
            variant="plain"
            color={IconButtonMoreColor}
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
