import React from 'react';
import styled from '../../styled-components';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import AvatarWithPresence from '../AvatarWithPresence';
import { PresenceProps } from '../../atoms';

type TIconMore = {
  awake?: boolean;
  handleSignOutClick?: ((event: React.MouseEvent<HTMLInputElement>) => void);
  src?: string;
} & PresenceProps;

const MenuListCompositionWrapper = styled.div`
  display: flex;
  margin-right: ${({ theme }) => `${1 * theme.spacing.unit}px`};
`;

const MenuWrapper = styled(Popper)``;

class MenuListComposition extends React.Component<TIconMore, { open: boolean }> {
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

  render() {
    const { open } = this.state;
    return (
      <MenuListCompositionWrapper className={this.props.className}>
        <AvatarWithPresence
          innerRef={this.anchorEl}
          aria-haspopup="true"
          onClick={this.handleToggle}
          {...this.props}
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
                    <MenuItem onClick={this.props.handleSignOutClick}>SignOut</MenuItem>
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

export default MenuListComposition;
