/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-30 23:02:14
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs/react';
import { withInfoDecorator, alignCenterDecorator } from '../../../utils/decorators';
import { JuiLink } from '../';

function getKnobs() {
  const content = text('content', 'button');
  const size = select(
    'size',
    {
      small: 'small',
      medium: 'medium',
      large: 'large',
    },
    'large',
  );
  const color = select(
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

storiesOf('Atoms/Link', module)
  .addDecorator(alignCenterDecorator)
  .addDecorator(withInfoDecorator(JuiLink, { inline: true }))
  .addWithJSX('Link', () => {
    const { content, ...rest } = getKnobs();
    return (
      <div>
        <JuiLink
          {...rest}
        >
          {content}
        </JuiLink>
      </div>
    );
  });
