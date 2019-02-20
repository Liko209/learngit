/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-08 14:35:10
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { select, text } from '@storybook/addon-knobs';

import { JuiThumbnail } from '../Thumbnail';

storiesOf('Components/Thumbnail', module).add('Thumbnail', () => {
  return (
    <JuiThumbnail
      iconType={''}
      url={text('url', 'ppt')}
      size={select('size', { small: 'small', large: 'large' }, 'large')}
    />
  );
});
