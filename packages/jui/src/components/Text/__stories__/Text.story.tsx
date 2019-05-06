/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-02 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiText } from '../Text';

const getTextKnob = () =>
  text('text', 'It will show tooltip when text truncated. ');
storiesOf('Components/Text', module)
  .addDecorator(withInfoDecorator(JuiText, { inline: true }))
  .add('Text', () => {
    return <JuiText>{getTextKnob()}</JuiText>;
  });
