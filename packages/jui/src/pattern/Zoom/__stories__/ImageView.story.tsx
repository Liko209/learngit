/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:16:55
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ReactElement, RefObject } from 'react';

import MuiDialog, { DialogProps } from '@material-ui/core/Dialog';
import { boolean, number, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import styled from '../../../foundation/styled-components';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiDragZoom } from '../DragZoom';
import { JuiZoomImage } from '../ZoomImage';
import { JuiImageView } from '../ImageView';

const knobs = {
  open: () => boolean('open', true),
  src: () =>
    text('src', 'https://fengyuanchen.github.io/viewerjs/images/tibet-3.jpg'),
  // ratio: () =>
  //   number('ratio', 1, {
  //     range: true,
  //     min: 0.1,
  //     max: 2,
  //     step: 0.1,
  //   }),
  containerWidth: () => number('containerWidth', 600),
  containerHeight: () => number('containerHeight', 400),
};
storiesOf('Pattern/ImageView', module)
  .addDecorator(withInfoDecorator(JuiZoomImage, { inline: true }))
  .add('ImageView', () => (
    <div
      style={{
        width: knobs.containerWidth(),
        height: knobs.containerHeight(),
      }}
    >
      <JuiImageView src={knobs.src()} width="100%" />
    </div>
  ));
