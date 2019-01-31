/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 18:05:01
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../foundation/styled-components';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import { JuiPaper } from '../../components/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

type MenuItems = {
  label: string;
  automationId?: string;
  ariaLabel?: string;
  onClick: (event: React.MouseEvent<HTMLInputElement>) => void;
}[];

type MenuExpandTrigger = React.SFC<{
  onClick: (event: React.MouseEvent<HTMLInputElement>) => void;
}>;

type MenuListCompositionProps = {
  awake?: boolean;
  menuItems: MenuItems;
  MenuExpandTrigger: MenuExpandTrigger;
  className?: string;
  automationId?: string;
};

const MenuListCompositionWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-right: ${({ theme }) => `${theme.spacing.unit}px`};
`;

const MenuWrapper = styled(Popper)``;

class JuiMenuListComposition extends React.PureComponent<
  MenuListCompositionProps,
  { open: boolean; anchorEl: HTMLElement | null }
> {
  constructor(props: MenuListCompositionProps) {
    super(props);
    this.state = {
      open: false,
      anchorEl: null,
    };
  }

  handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ open: !this.state.open, anchorEl: event.currentTarget });
  }

  handleClose = (event: React.MouseEvent<HTMLElement>) => {
    const node = this.state.anchorEl;
    if (node && node.contains(event.target as Node)) {
      return;
    }

    this.setState({ open: false, anchorEl: null });
  }

  handleMenuItemClick = (menuItemEvent: Function) => (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    this.handleClose(event);
    menuItemEvent();
  }

  render() {
    const { open, anchorEl } = this.state;
    const { MenuExpandTrigger, menuItems, automationId } = this.props;
    return (
      <MenuListCompositionWrapper className={this.props.className}>
        <MenuExpandTrigger aria-haspopup="true" onClick={this.handleToggle} />
        <MenuWrapper
          open={open}
          anchorEl={anchorEl}
          transition={true}
          disablePortal={true}
          data-test-automation-id={automationId}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <JuiPaper>
                {open && (
                  <ClickAwayListener onClickAway={this.handleClose}>
                    <MenuList>
                      {menuItems.map((item, index) => {
                        return (
                          <MenuItem
                            key={index}
                            tabIndex={0}
                            arai-label={item.ariaLabel}
                            data-test-automation-id={item.automationId}
                            onClick={this.handleMenuItemClick(item.onClick)}
                          >
                            {item.label}
                          </MenuItem>
                        );
                      })}
                    </MenuList>
                  </ClickAwayListener>
                )}
              </JuiPaper>
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
