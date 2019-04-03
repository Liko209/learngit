/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2018-3-1 10:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiFabGroup } from '../index';
import {
  withInfoDecorator,
  alignCenterDecorator,
} from '../../../foundation/utils/decorators';
import { JuiIconButton } from '../../../components/Buttons';

storiesOf('Pattern/ImageViewer', module)
  .addDecorator(alignCenterDecorator)
  .addDecorator(withInfoDecorator(JuiFabGroup, { inline: true }))
  .add('ZoomGroup', () => {
    return (
      <JuiFabGroup
        centerText={'100%'}
        resetMode={true}
        ZoomIn={
          <JuiIconButton variant="plain" tooltipTitle="zoom_in">
            zoom_in
          </JuiIconButton>
        }
        ZoomOut={
          <JuiIconButton variant="plain" tooltipTitle="zoom_out">
            zoom_out
          </JuiIconButton>
        }
        ZoomReset={
          <JuiIconButton variant="plain" tooltipTitle="zoom_out">
            reset_zoom
          </JuiIconButton>
        }
      />
    );
  });
