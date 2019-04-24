/*
 * @Author: ken.li
 * @Date: 2019-03-15 17:00:19
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import {
  withInfoDecorator,
  alignCenterDecorator,
} from '../../../../foundation/utils/decorators';
import { boolean, select, text } from '@storybook/addon-knobs';
import { JuiLinkButton, JuiLinkButtonProps } from '../';

function getKnobs() {
  const content = text('content', 'button');
  const size = select<JuiLinkButtonProps['size']>(
    'size',
    {
      small: 'small',
      large: 'large',
    },
    'large',
  );
  const color = select<JuiLinkButtonProps['color']>(
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
  .addDecorator(withInfoDecorator(JuiLinkButton, { inline: true }))
  .add('Link Button', () => {
    const { content, ...rest } = getKnobs();
    return (
      <div>
        <JuiLinkButton {...rest}>{content}</JuiLinkButton>
      </div>
    );
  });
