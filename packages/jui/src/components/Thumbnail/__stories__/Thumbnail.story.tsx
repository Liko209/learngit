/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-08 14:35:10
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs';
import { JuiThumbnail } from '../Thumbnail';
import image from '../../../assets/contemplative-reptile.jpg';

storiesOf('Components/Thumbnail', module).add('Thumbnail', () => {
  return (
    <JuiThumbnail
      url={image}
      size={select('size', { small: 'small', large: 'large' }, 'large')}
    />
  );
});
