import React from 'react';
import styled from '../../styled-components';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

type TIconMore = {
  items?: any[];
  open: boolean;
  style?: {
    top?: number;
    right?: number
  };
  handleClose: ((event: React.ChangeEvent|React.TouchEvent|React.MouseEvent<HTMLElement>, index?: number) => void);
};

const MenuListCompositionWrapper = styled.div`
  position: relative;
  display: flex;
  margin-right: ${({ theme }) => `${1 * theme.spacing.unit}px`};
`;

const MenuWrapper = styled(Popper)`
  position: absolute;
  top: 40px;
  left: 6px;
`;
const StyledMenuItem = styled(MenuItem)`
  && {
    font-size: 12px;
    padding-top: 0;
    padding-bottom: 0;
    height: 32px;
  }
`;
class MenuListPanel extends React.Component<TIconMore> {
  constructor(props: TIconMore) {
    super(props);
  }
  componentWillReceiveProps(nextProps: TIconMore) {
    if (this.props.open !== nextProps.open) {
      this.setState({
        open: nextProps.open,
      });
    }
  }
  anchorEl = React.createRef<Element>();

  render() {
    const { items, handleClose, open, children } = this.props;
    return (
      <MenuListCompositionWrapper>
        {children ? children : null}
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
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList>
                    {
                      items!.map((item, index) => {
                        return (<StyledMenuItem onClick={handleClose.bind(this, event, index)} key={index}>{item}</StyledMenuItem>);
                      })
                    }
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

export default MenuListPanel;
