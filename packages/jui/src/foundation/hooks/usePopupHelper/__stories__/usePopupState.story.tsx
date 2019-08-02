/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-02 18:04:31
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiButton } from '../../../../components/Buttons';
import { JuiMenu, JuiMenuItem } from '../../../../components/Menus';
import { usePopupHelper } from '../usePopupHelper';

storiesOf('Hooks/usePopupState', module).add('Click to open menu', () => {
  const Demo = () => {
    const popupHelper = usePopupHelper({
      popupId: 'popup_1',
      variant: 'popover',
    });
    return (
      <div>
        <JuiButton variant="contained" {...popupHelper.TriggerProps}>
          Click to open menu
        </JuiButton>
        <JuiMenu {...popupHelper.MenuProps}>
          <JuiMenuItem onClick={popupHelper.close}>Cake</JuiMenuItem>
          <JuiMenuItem onClick={popupHelper.close}>Death</JuiMenuItem>
        </JuiMenu>
      </div>
    );
  };
  return <Demo />;
});
