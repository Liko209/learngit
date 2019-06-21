/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-05-23 14:10:03
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState, useCallback } from 'react';
import { StyledMenuItem } from '../Menus/MenuItem';
import { JuiMenuList } from '../Menus/MenuList';
import { MenuItemProps as MuiMenuItemProps } from '@material-ui/core/MenuItem';
import { JuiPopperMenu } from '../../pattern/PopperMenu';
import { JuiIconography } from '../../foundation/Iconography';
import styled from '../../foundation/styled-components';

type JuiSubMenuProps = {
  title: string;
  children: React.ReactNode;
} & MuiMenuItemProps;

const StyledSubMenuItem = styled(StyledMenuItem)`
  && {
    display: flex;
    justify-content: space-between;
  }
`;

const JuiSubMenu = React.memo((props: JuiSubMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<EventTarget & Element | null>(null);

  const openPopper = (event: React.MouseEvent) => {
    const { disabled } = props;
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const closePopper = () => {
    setAnchorEl(null);
  };
  const { title, disabled, ...rest } = props;

  const Anchor = useCallback(() => {
    if (disabled) {
      return <StyledMenuItem disabled={true}>{title}</StyledMenuItem>;
    }
    return (
      <StyledSubMenuItem {...rest}>
        {title}
        <JuiIconography iconSize="medium" iconColor={['grey', '600']}>
          arrow_right
        </JuiIconography>
      </StyledSubMenuItem>
    );
  },                         [disabled]);

  const open = Boolean(anchorEl);

  return (
    <JuiPopperMenu
      open={open}
      anchorEl={anchorEl}
      Anchor={Anchor}
      placement="right-start"
      onMouseEnter={openPopper}
      onMouseLeave={closePopper}
      onClose={closePopper}
    >
      <JuiMenuList>{props.children}</JuiMenuList>
    </JuiPopperMenu>
  );
});

export { JuiSubMenu };
