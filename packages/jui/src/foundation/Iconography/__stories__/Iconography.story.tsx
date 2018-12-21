/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:03
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import {
  JuiIconography,
  JuiGoogleDriveIcon,
  JuiOneDriveIcon,
  JuiAttachmentIcon,
  JuiDropboxIcon,
  JuiEvernoteIcon,
  JuiOneboxIcon,
} from '..';

storiesOf('Foundation', module)
  .addDecorator(withInfoDecorator(JuiIconography, { inline: true }))
  .add('Iconography', () => (
    <div>
      <JuiIconography>star</JuiIconography>
      <JuiIconography>people</JuiIconography>
      <JuiIconography>keyboard_arrow_up</JuiIconography>
      <JuiIconography>keyboard_arrow_down</JuiIconography>
      <JuiGoogleDriveIcon color="primary" />
      <JuiOneDriveIcon />
      <JuiAttachmentIcon />
      <JuiDropboxIcon />
      <JuiEvernoteIcon />
      <JuiOneboxIcon />
    </div>
  ));
