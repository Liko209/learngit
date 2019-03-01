/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:16:55
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import { number, text, array } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiDragZoomImage } from '../DragZoomImage';

const knobs = {
  // containerWidth: () => number('containerWidth', 700),
  containerHeight: () => number('containerHeight', 500),
  src: () =>
    text('src', 'https://fengyuanchen.github.io/viewerjs/images/tibet-3.jpg'),
  // minPixel: () => number('minPixel', 200),
  // maxPixel: () => number('maxPixel', 2000),
  // step: () => number('step', 0.2),
  // accuracy: () =>
  //   number('accuracy', 2, { step: 1, max: 10, min: 1, range: false }),
  // wheel: () => boolean('wheel', true),
  padding: () =>
    array<number>('padding', [32, 32, 32, 32], ',') as [
      number,
      number,
      number,
      number
    ],
};
storiesOf('Pattern/DragZoom', module)
  .addDecorator(withInfoDecorator(JuiDragZoomImage, { inline: true }))
  .add('DragZoomImage', () => (
    <div
      style={{
        width: '100%',
        height: knobs.containerHeight(),
      }}
    >
      <JuiDragZoomImage
        src={knobs.src()}
        options={{
          minPixel: 200,
          maxPixel: 1500,
          step: 0.1,
          wheel: true,
          padding: knobs.padding(),
        }}
      />
    </div>
  ));
