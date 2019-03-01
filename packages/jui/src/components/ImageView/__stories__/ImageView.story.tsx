/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:16:55
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import { boolean, number, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiImageView } from '../ImageView';

const knobs = {
  open: () => boolean('open', true),
  src: () =>
    text('src', 'https://fengyuanchen.github.io/viewerjs/images/tibet-3.jpg'),
  containerWidth: () => number('containerWidth', 600),
  containerHeight: () => number('containerHeight', 400),
};
storiesOf('Components/ImageView', module)
  .addDecorator(withInfoDecorator(JuiImageView, { inline: true }))
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
