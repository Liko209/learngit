import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs';
import { RuiButton } from '../';
import { alignCenterDecorator } from '../../../../storybook/decorators';

function getKnobs() {
  const content = text('content', 'Button');
  const size = select(
    'size',
    {
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
      error: 'error',
    },
    'primary',
  );
  const disabled = boolean('disabled', false);
  const loading = boolean('loading', false);
  const fullWidth = boolean('fullWidth', false);
  return {
    content,
    size,
    color,
    disabled,
    loading,
    fullWidth,
  };
}

storiesOf('Buttons', module)
  .addDecorator(alignCenterDecorator)
  .add('Contained Button', () => {
    const { content, ...rest } = getKnobs();
    return (
      <div>
        <RuiButton variant="contained" {...rest}>
          {content}
        </RuiButton>
      </div>
    );
  })
  .add('Outlined Button', () => {
    const { content, ...rest } = getKnobs();
    return (
      <div>
        <RuiButton variant="outlined" {...rest}>
          {content}
        </RuiButton>
      </div>
    );
  })
  .add('Text Button', () => {
    const { content, ...rest } = getKnobs();
    return (
      <div>
        <RuiButton variant="text" {...rest}>
          {content}
        </RuiButton>
      </div>
    );
  })
  .add('Round Button', () => {
    const { ...rest } = getKnobs();
    return (
      <div>
        <RuiButton variant="round" {...rest}>
          Jump to Conversation
        </RuiButton>
      </div>
    );
  });
