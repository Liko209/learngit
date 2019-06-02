/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:22:47
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select } from '@storybook/addon-knobs';
import { alignCenterDecorator } from '../../../../foundation/utils/decorators';

import { JuiIconButton, JuiIconButtonProps } from '..';
import styled from '../../../../foundation/styled-components';
import star from '../../../../assets/jupiter-icon/icon-star.svg';

const Wrapper = styled.div`
  .iconButtonWrapper {
    margin-right: 20px;
  }
`;

const knobs = {
  size: () =>
    select<JuiIconButtonProps['size']>(
      'size',
      {
        small: 'small',
        medium: 'medium',
        large: 'large',
      },
      'medium',
    ),
  color: () =>
    select(
      'color',
      {
        primary: 'primary',
        secondary: 'secondary',
      },
      'primary',
    ),
  invisible: () => boolean('invisible', false),
  awake: () => boolean('awake', true),
  disabled: () => boolean('disabled', false),
};
storiesOf('Components/Buttons/IconButtons', module)
  .addDecorator(alignCenterDecorator)
  .add('plain', () => {
    return (
      <Wrapper>
        <JuiIconButton
          className="iconButtonWrapper"
          variant="plain"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="add"
          symbol={star}
        />
      </Wrapper>
    );
  })
  .add('round', () => {
    return (
      <Wrapper>
        <JuiIconButton
          className="iconButtonWrapper"
          variant="round"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="I'm a star"
          symbol={star}
        />
      </Wrapper>
    );
  });
