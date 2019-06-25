/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 14:20:30
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs';
import { JuiPopover } from '../index';
import { JuiMenuList, JuiMenuItem } from '../../Menus';
import { JuiButton } from '../../Buttons';
import { PopoverOrigin } from '@material-ui/core/Popover';

const knobs = {
  anchorOrigin: {
    vertical: () =>
      select<PopoverOrigin['vertical']>(
        'anchorOrigin.vertical',
        {
          top: 'top',
          center: 'center',
          bottom: 'bottom',
        },
        'bottom',
      ),
    horizontal: () =>
      select<PopoverOrigin['horizontal']>(
        'anchorOrigin.horizontal',
        {
          left: 'left',
          center: 'center',
          right: 'right',
        },
        'center',
      ),
  },
  transformOrigin: {
    vertical: () =>
      select<PopoverOrigin['vertical']>(
        'transformOrigin.vertical',
        {
          top: 'top',
          center: 'center',
          bottom: 'bottom',
        },
        'top',
      ),
    horizontal: () =>
      select<PopoverOrigin['horizontal']>(
        'transformOrigin.horizontal',
        {
          left: 'left',
          center: 'center',
          right: 'right',
        },
        'center',
      ),
  },
};

class Popover extends React.PureComponent {
  state = {
    anchorEl: null,
  };
  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  }

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  }

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
    return (
      <>
        <JuiButton onClick={this.handleClick}>Open Popover</JuiButton>
        <JuiPopover
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: knobs.anchorOrigin.vertical(),
            horizontal: knobs.anchorOrigin.horizontal(),
          }}
          transformOrigin={{
            vertical: knobs.transformOrigin.vertical(),
            horizontal: knobs.transformOrigin.horizontal(),
          }}
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
        </JuiPopover>
      </>
    );
  }
}

storiesOf('Components/Popover', module).add('Popover', () => <Popover />);
