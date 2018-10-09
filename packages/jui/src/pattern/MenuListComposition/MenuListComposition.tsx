/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 18:05:01
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../foundation/styled-components';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

type MenuItems = {
  label: string;
  onClick: (event: React.MouseEvent<HTMLInputElement>) => void;
}[];

type MenuExpandTrigger = React.SFC<{
  innerRef: React.RefObject<HTMLElement>;
  onClick: () => void;
}>;

type MenuListCompositionProps = {
  awake?: boolean;
  menuItems: MenuItems;
  MenuExpandTrigger: MenuExpandTrigger;
  className?: string;
};

const MenuListCompositionWrapper = styled.div`
  display: flex;
  margin-right: ${({ theme }) => `${1 * theme.spacing.unit}px`};
`;

const MenuWrapper = styled(Popper)``;

class JuiMenuListComposition extends React.Component<
  MenuListCompositionProps,
  { open: boolean }
> {
  state = {
    open: false,
  };

  anchorEl = React.createRef<HTMLElement>();

  handleToggle = () => {
    this.setState(state => ({ open: !state.open }));
  }

  handleClose = (event: React.MouseEvent<HTMLElement>) => {
    const node = this.anchorEl.current;
    if (node && node.contains(event.currentTarget)) {
      return;
    }

    this.setState({ open: false });
  }

  handleMenuItemClick = (
    menuItemEvent: () => void,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    this.handleClose(event);
    menuItemEvent();
  }

  render() {
    const { open } = this.state;
    const { MenuExpandTrigger, menuItems } = this.props;
    return (
      <MenuListCompositionWrapper className={this.props.className}>
        <MenuExpandTrigger
          innerRef={this.anchorEl}
          aria-haspopup="true"
          onClick={this.handleToggle}
        />
        <MenuWrapper
          open={open}
          anchorEl={this.anchorEl.current}
          transition={true}
          disablePortal={true}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={this.handleClose}>
                  <MenuList>
                    {menuItems.map((item, index) => {
                      return (
                        <MenuItem
                          key={index}
                          onClick={this.handleMenuItemClick.bind(
                            this,
                            item.onClick,
                          )}
                        >
                          {item.label}
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </MenuWrapper>
      </MenuListCompositionWrapper>
    );
  }
}

export {
  JuiMenuListComposition,
  MenuItems,
  MenuExpandTrigger,
  MenuListCompositionProps,
};
