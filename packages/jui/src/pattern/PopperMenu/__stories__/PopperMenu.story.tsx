/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-12-17 09:31:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiPopperMenu } from '../index';
import { JuiMenuList, JuiMenuItem } from '../../../components/Menus';
import { JuiButton } from '../../../components/Buttons';

const knobs = {
  placement: () =>
    select(
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

class PopperMenu extends React.PureComponent {
  private _Anchor = () => {
    return <JuiButton>Open Popper</JuiButton>;
  }
  render() {
    return (
      <>
        <JuiPopperMenu Anchor={this._Anchor} placement={knobs.placement()}>
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

storiesOf('Pattern/PopperMenu', module)
  .addDecorator(withInfoDecorator(JuiPopperMenu, { inline: true }))
  .add('PopperMenu', () => <PopperMenu />);
