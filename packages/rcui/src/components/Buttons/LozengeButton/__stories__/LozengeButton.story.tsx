import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs';

import { RuiLozengeButton } from '../LozengeButton';
import alignCenterDecorator from '../../../../storybook/decorators/alignCenterDecorator';

const knobs = {
  content: () => text('content', '2 New Messages'),
  loading: () => boolean('loading', false),
  arrowDirection: () =>
    select(
      'arrowDirecton',
      {
        up: 'up',
        down: 'down',
      },
      'down',
    ),
};
storiesOf('Buttons', module)
  .addDecorator(alignCenterDecorator)
  .add('LozengeButton', () => {
    return (
      <RuiLozengeButton
        loading={knobs.loading()}
        arrowDirection={knobs.arrowDirection()}
      >
        {knobs.content()}
      </RuiLozengeButton>
    );
  });
