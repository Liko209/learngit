/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:22:47
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select } from '@storybook/addon-knobs';
import {
  alignCenterDecorator,
  withInfoDecorator,
} from '../../../../foundation/utils/decorators';

import { JuiIconButton, JuiIconButtonProps } from '..';
import styled from '../../../../foundation/styled-components';

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
  .addDecorator(withInfoDecorator(JuiIconButton, { inline: true }))
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
        >
          new_actions
        </JuiIconButton>
        <JuiIconButton
          className="iconButtonWrapper"
          variant="plain"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="remove"
        >
          remove
        </JuiIconButton>
        <JuiIconButton
          className="iconButtonWrapper"
          variant="plain"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="thumbup"
        >
          thumbup
        </JuiIconButton>
        <JuiIconButton
          className="iconButtonWrapper"
          variant="plain"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="event"
        >
          event
        </JuiIconButton>
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
        >
          star
        </JuiIconButton>
        <JuiIconButton
          className="iconButtonWrapper"
          variant="round"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="attachment"
        >
          attachment
        </JuiIconButton>
        <JuiIconButton
          className="iconButtonWrapper"
          variant="round"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="I'm a star"
        >
          star_border
        </JuiIconButton>
        <JuiIconButton
          className="iconButtonWrapper"
          variant="round"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="dashboard"
        >
          dashboard
        </JuiIconButton>
      </Wrapper>
    );
  });
