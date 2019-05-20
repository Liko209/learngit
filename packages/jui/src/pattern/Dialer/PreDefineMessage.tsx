/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-05-03 14:08:37
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  JuiListItem,
  JuiListItemText,
  JuiListItemSecondaryAction,
} from '../../components/Lists';
import styled from '../../foundation/styled-components';
import {
  spacing,
  typography,
  height,
  grey,
  width,
} from '../../foundation/utils/styles';
import { JuiIconography } from '../../foundation/Iconography';
import { JuiPopoverMenu } from '../PopoverMenu';
import { JuiMenuList, JuiMenuItem } from '../../components/Menus';
import { MenuItemProps } from '@material-ui/core/MenuItem';

type Props = {
  text: string;
  children?: JSX.Element[];
  handleClick?: () => void;
  automationId?: string;
};

const StyledListItem = styled(JuiListItem)`
  && {
    padding: ${spacing(2, 4)};
    height: ${height(10)};
    ${typography('body1')};
    color: ${grey('900')};
  }
`;

const StyledMenuList = styled(JuiMenuList)`
  width: ${width(45)};
`;

const StyledMenuItem = styled(JuiMenuItem)`
  && {
    display: flex;
    justify-content: space-between;
  }
`;

const StyledIconContainer = styled(JuiListItemSecondaryAction)`
  display: none;
  height: ${height(4)};
  line-height: ${height(4)};
  ${StyledListItem}:hover & {
    display: inline-block;
  }
  ${StyledMenuItem}:hover & {
    display: inline-block;
  }
`;

const JuiPreDefineMenuItem = React.memo(
  (props: MenuItemProps & { automationId?: string }) => (
    <StyledMenuItem data-test-automation-id={props.automationId} {...props}>
      <span>{props.children}</span>
      <StyledIconContainer>
        <JuiIconography iconSize="small" iconColor={['grey', '500']}>
          send
        </JuiIconography>
      </StyledIconContainer>
    </StyledMenuItem>
  ),
);

const JuiPreDefineItem = React.memo(
  (props: {
    text: string;
    handleClick?: () => void;
    automationId?: string;
  }) => {
    const { text, handleClick, automationId } = props;
    return handleClick ? (
      <StyledListItem
        onClick={handleClick}
        data-test-automation-id={automationId}
      >
        <JuiListItemText primary={text} />
        <StyledIconContainer>
          <JuiIconography iconSize="small" iconColor={['grey', '500']}>
            send
          </JuiIconography>
        </StyledIconContainer>
      </StyledListItem>
    ) : (
      <StyledListItem data-test-automation-id={automationId}>
        <JuiListItemText primary={text} />
      </StyledListItem>
    );
  },
);

const JuiPreDefineMessage = React.memo((props: Props) => {
  const { text, children, handleClick, automationId } = props;
  return children && children.length > 0 ? (
    <JuiPopoverMenu
      Anchor={() => (
        <JuiPreDefineItem text={text} automationId={automationId} />
      )}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <StyledMenuList>{children}</StyledMenuList>
    </JuiPopoverMenu>
  ) : (
    <JuiPreDefineItem
      text={text}
      handleClick={handleClick}
      automationId={automationId}
    />
  );
});
export { JuiPreDefineMessage, JuiPreDefineMenuItem };
