/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-12-17 09:31:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs';
import { JuiPopperMenu, JuiPopperMenuProps } from '../index';
import { JuiMenuList, JuiMenuItem } from '../../../components/Menus';
import { JuiButton } from '../../../components/Buttons';

const knobs = {
  placement: () =>
    select<JuiPopperMenuProps['placement']>(
      'placement',
      {
        bottomEnd: 'bottom-end',
        bottomStart: 'bottom-start',
        bottom: 'bottom',
        leftEnd: 'left-end',
        leftStart: 'left-start',
        left: 'left',
        rightEnd: 'right-end',
        rightStart: 'right-start',
        right: 'right',
        topEnd: 'top-end',
        topStart: 'top-start',
        top: 'top',
      },
      'bottom',
    ),
};
type State = { open: boolean; anchorEl: EventTarget & Element | null };
class PopperMenu extends React.PureComponent<{}, State> {
  state = {
    open: false,
    anchorEl: null,
  };
  private _Anchor = () => {
    return <JuiButton onClick={this.openPopper}>Open Popper</JuiButton>;
  }
  openPopper = (event: any) => {
    const { currentTarget } = event;
    this.setState(state => ({
      anchorEl: currentTarget,
      open: !state.open,
    }));
  }
  closePopper = () => {
    this.setState({
      open: false,
    });
  }

  render() {
    return (
      <>
        <JuiPopperMenu
          open={this.state.open}
          Anchor={this._Anchor}
          placement={knobs.placement()}
          onClose={this.closePopper}
          anchorEl={this.state.anchorEl}
        >
          <JuiMenuList>
            <JuiMenuItem onClick={action('onClick Profile')}>
              Profile
            </JuiMenuItem>
            <JuiMenuItem onClick={action('onClick My account')}>
              My account
            </JuiMenuItem>
            <JuiMenuItem onClick={action('onClick Logout')}>Logout</JuiMenuItem>
          </JuiMenuList>
        </JuiPopperMenu>
      </>
    );
  }
}

storiesOf('Pattern/PopperMenu', module).add('PopperMenu', () => <PopperMenu />);
