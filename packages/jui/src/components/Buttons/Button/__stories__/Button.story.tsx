/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-30 23:02:14
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs';
import { alignCenterDecorator } from '../../../../foundation/utils/decorators';
import { JuiFabButton, JuiButton, JuiButtonProps, JuiRoundButton } from '..';
import styled from '../../../../foundation/styled-components';
import previous from '../../../../assets/jupiter-icon/icon-previous.svg';
import forward from '../../../../assets/jupiter-icon/icon-forward.svg';

function getKnobs() {
  const content = text('content', 'button');
  const size = select<JuiButtonProps['size']>(
    'size',
    {
      large: 'large',
      medium: 'medium',
    },
    'large',
  );
  const color = select<JuiButtonProps['color']>(
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
    const { content, color, ...rest } = getKnobs();
    return (
      <div>
        <JuiRoundButton color={color as any} {...rest}>
          {content}
        </JuiRoundButton>
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
          iconColor={['common', 'white']}
          iconName="previous"
          icon={previous}
        />
        <JuiFabButton
          {...rest}
          className="buttonWrapper"
          tooltipTitle="forward"
          iconColor={['common', 'white']}
          iconName="forward"
          icon={forward}
        />
      </Wrapper>
    );
  });
