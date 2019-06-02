/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-30 23:02:14
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs';
import { alignCenterDecorator } from '../../../foundation/utils/decorators';
import { JuiLink, JuiLinkProps } from '../';

function getKnobs() {
  const content = text('content', 'button');
  const size = select<JuiLinkProps['size']>(
    'size',
    {
      small: 'small',
      medium: 'medium',
      large: 'large',
    },
    'medium',
  );
  const color = select<JuiLinkProps['color']>(
    'color',
    {
      primary: 'primary',
      secondary: 'secondary',
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

storiesOf('Components', module)
  .addDecorator(alignCenterDecorator)
  .add('Link', () => {
    const { content, ...rest } = getKnobs();
    return (
      <div>
        <JuiLink {...rest}>{content}</JuiLink>
      </div>
    );
  });
