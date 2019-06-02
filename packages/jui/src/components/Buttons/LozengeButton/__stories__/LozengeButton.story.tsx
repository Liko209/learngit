/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-07 10:39:31
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs';
import { alignCenterDecorator } from '../../../../foundation/utils/decorators';
import { JuiLozengeButton, JuiLozengeButtonProps } from '../';

function getKnobs() {
  const content = text('content', '2 New Messages');
  const loading = boolean('loading', false);
  const arrowDirection = select<JuiLozengeButtonProps['arrowDirection']>(
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
  .add('Lozenge Button', () => {
    const { content, ...rest } = getKnobs();
    return <JuiLozengeButton {...rest}>{content}</JuiLozengeButton>;
  });
