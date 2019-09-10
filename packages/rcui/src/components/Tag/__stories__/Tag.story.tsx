/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-08-26 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { select, text } from '@storybook/addon-knobs';
import { RuiTag } from '../index';

function getKnobs() {
  const content = text('content', 'tag test overflowsannsadsndjdnsaasddksjnadsndsasdasdadsadsdsa');
  const color = select(
    'color',
    {
      primary: 'primary',
      secondary: 'secondary',
    },
    'primary',
  );
  return {
    content,
    color,
  };
}

storiesOf('Tag', module)
  .add('Tag', () => {
    const { content, color } = getKnobs();
    return (
      <div>
        <RuiTag  content={content} color={color} />
      </div>
    );
});
