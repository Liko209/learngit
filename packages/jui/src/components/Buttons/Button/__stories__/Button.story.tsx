/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-30 23:02:14
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs';
import {
  withInfoDecorator,
  alignCenterDecorator,
} from '../../../../foundation/utils/decorators';
import { JuiButton } from '../';

function getKnobs() {
  const content = text('content', 'button');
  const size = select(
    'size',
    {
      small: 'small',
      large: 'large',
    },
    'large',
  );
  const color = select(
    'color',
    {
      primary: 'primary',
      secondary: 'secondary',
      negative: 'negative',
    },
    'primary',
  );
  const disabled = boolean('disabled', false);
  return {
    content,
    size,
    color,
    disabled,
  };
}

storiesOf('Components/Buttons', module)
  .addDecorator(alignCenterDecorator)
  .addDecorator(withInfoDecorator(JuiButton, { inline: true }))
  .add('Contained Button', () => {
    const { content, ...rest } = getKnobs();
    return (
      <div>
        <JuiButton variant="contained" {...rest}>
          {content}
        </JuiButton>
      </div>
    );
  })
  .add('Text Button', () => {
    const { content, ...rest } = getKnobs();
    return (
      <div>
        <JuiButton variant="text" {...rest}>
          {content}
        </JuiButton>
      </div>
    );
  })
  .add('Round Button', () => {
    const { content, ...rest } = getKnobs();
    return (
      <div>
        <JuiButton variant="round" {...rest}>
          {content}
        </JuiButton>
      </div>
    );
  });
