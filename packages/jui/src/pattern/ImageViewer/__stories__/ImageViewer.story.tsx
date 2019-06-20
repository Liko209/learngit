/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2018-3-1 10:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiFabGroup } from '../index';
import { alignCenterDecorator } from '../../../foundation/utils/decorators';
import { JuiIconButton } from '../../../components/Buttons';
import zoomIn from '../../../assets/jupiter-icon/icon-zoom-in.svg';
import zoomOut from '../../../assets/jupiter-icon/icon-zoom-out.svg';
import resetZoom from '../../../assets/jupiter-icon/icon-reset-zoom.svg';

storiesOf('Pattern/ImageViewer', module)
  .addDecorator(alignCenterDecorator)
  .add('ZoomGroup', () => {
    return (
      <JuiFabGroup
        centerText={'100%'}
        resetMode={true}
        ZoomIn={
          <JuiIconButton
            variant="plain"
            tooltipTitle="zoom_in"
            symbol={zoomIn}
          />
        }
        ZoomOut={
          <JuiIconButton
            variant="plain"
            tooltipTitle="zoom_out"
            symbol={zoomOut}
          />
        }
        ZoomReset={
          <JuiIconButton
            variant="plain"
            tooltipTitle="reset zoom"
            symbol={resetZoom}
          />
        }
      />
    );
  });
