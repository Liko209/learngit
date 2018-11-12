/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-07 10:39:31
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs';
import {
  withInfoDecorator,
  alignCenterDecorator,
} from '../../../../foundation/utils/decorators';
import { JuiLozengeButton } from '../';

function getKnobs() {
  const content = text('content', '2 New Messages');
  const loading = boolean('loading', false);
  const arrowDirection = select(
    'arrowDirection',
    {
      up: 'up',
      down: 'down',
    },
    'up',
  );
  return {
    content,
    loading,
    arrowDirection,
  };
}

storiesOf('Components/Buttons', module)
  .addDecorator(alignCenterDecorator)
  .addDecorator(withInfoDecorator(JuiLozengeButton, { inline: true }))
  .add('Lozenge Button', () => {
    const { content, ...rest } = getKnobs();
    return <JuiLozengeButton {...rest}>{content}</JuiLozengeButton>;
  });
