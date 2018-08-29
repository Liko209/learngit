import React from 'react';
import styled from '../../styled-components';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import IconButton from '../IconButton';

type TIconMore = {
  awake?: boolean;
  handleSignOutClick?: ((event: React.MouseEvent<HTMLInputElement>) => void);
};

const MenuListCompositionWrapper = styled.div`
  display: flex;
  margin-right: ${({ theme }) => `${1 * theme.spacing.unit}px`};
`;

const MenuWrapper = styled(Popper)``;

class MenuListComposition extends React.Component<TIconMore, { open: boolean }> {
  state = {
    open: false,
  };

  anchorEl = React.createRef<Element>();

  handleToggle = () => {
    this.setState(state => ({ open: !state.open }));
  }

  handleClose = (event: React.MouseEvent<Element>) => {
    const node = this.anchorEl.current;
    if (node && node.contains(event.currentTarget)) {
      return;
    }

    this.setState({ open: false });
  }

  render() {
    const { open } = this.state;
    return (
      <MenuListCompositionWrapper>
        <IconButton
          buttonRef={this.anchorEl}
          aria-haspopup="true"
          size="medium"
          tooltipTitle="menu"
          awake={this.props.awake}
          onClick={this.handleToggle}
        >
          add_circle
        </IconButton>
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
                    <MenuItem onClick={this.handleClose}>Profile</MenuItem>
                    <MenuItem onClick={this.handleClose}>My account</MenuItem>
                    <MenuItem onClick={this.props.handleSignOutClick}>Logout</MenuItem>
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
