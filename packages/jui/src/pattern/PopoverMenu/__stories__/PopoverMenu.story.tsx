/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-12-14 15:47:45
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs';
import { JuiPopoverMenu } from '../index';
import { JuiMenuList, JuiMenuItem } from '../../../components/Menus';
import { JuiButton } from '../../../components/Buttons';

const knobs = {
  anchorOrigin: {
    vertical: () =>
      select<'bottom' | 'top' | 'center'>(
        'anchorOrigin.vertical',
        {
          top: 'top',
          center: 'center',
          bottom: 'bottom',
        },
        'bottom',
      ),
    horizontal: () =>
      select<'left' | 'center' | 'right'>(
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
      select<'bottom' | 'top' | 'center'>(
        'transformOrigin.vertical',
        {
          top: 'top',
          center: 'center',
          bottom: 'bottom',
        },
        'top',
      ),
    horizontal: () =>
      select<'left' | 'center' | 'right'>(
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

class PopoverMenu extends React.PureComponent {
  private _Anchor = () => {
    return <JuiButton>Open Popover</JuiButton>;
  }
  render() {
    return (
      <>
        <JuiPopoverMenu
          Anchor={this._Anchor}
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
        </JuiPopoverMenu>
      </>
    );
  }
}

storiesOf('Pattern/PopoverMenu', module).add('PopoverMenu', () => (
  <PopoverMenu />
));
