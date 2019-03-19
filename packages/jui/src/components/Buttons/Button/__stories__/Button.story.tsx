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
import { JuiFabButton, JuiButton } from '../';
import styled from '../../../../foundation/styled-components';

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
  const loading = boolean('loading', false);
  return {
    content,
    size,
    color,
    disabled,
    loading,
  };
}

const Wrapper = styled.div`
  .buttonWrapper {
    margin-right: 20px;
  }
`;

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
  })
  .add('Fab Button', () => {
    const knobs = getKnobs();
    const { content, ...rest } = knobs;
    return (
      <Wrapper>
        <JuiFabButton
          {...rest}
          className="buttonWrapper"
          tooltipTitle="previous"
          color="common.white"
          iconColor={['grey', '900']}
          iconName="previous"
        />
        <JuiFabButton
          {...rest}
          className="buttonWrapper"
          tooltipTitle="forward"
          iconColor={['grey', '900']}
          iconName="forward"
        />
      </Wrapper>
    );
  });
