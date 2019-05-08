import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs';
import alignCenterDecorator from '../../../storybook/decorators/alignCenterDecorator';
import { RuiLink } from '../';

function getKnobs() {
  const content = text('content', 'Button');
  const size = select(
    'size',
    {
      small: 'small',
      medium: 'medium',
      large: 'large',
    },
    'medium',
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

storiesOf('Link', module)
  .addDecorator(alignCenterDecorator)
  .add('Link', () => {
    const { content, ...rest } = getKnobs();
    return (
      <div>
        <RuiLink {...rest}>{content}</RuiLink>
      </div>
    );
  });
