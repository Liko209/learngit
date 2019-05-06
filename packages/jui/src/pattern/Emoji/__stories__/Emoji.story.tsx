/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-13 15:50:01
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { JuiEmoji } from '..';

storiesOf('Pattern/Emoji', module).add('Emoji Button', () => {
  return (
    <JuiEmoji
      title="Pick your emoji…"
      spritImage={'/icon/sheet_emojione_64.png'}
      handlerIcon="emoji"
    />
  );
});
