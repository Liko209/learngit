/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:22:47
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select } from '@storybook/addon-knobs/react';
import { action } from '@storybook/addon-actions';
import { alignCenterDecorator, withInfoDecorator } from '../../../utils/decorators';

import JuiIconButton from '..';
import styled from '../../../styled-components';

const Wrapper = styled.div`
  .iconButtonWrapper {
    margin-right: 20px;
  }
`;

const knobs = {
  size: () => select(
    'size',
    {
      small: 'small',
      medium: 'medium',
      large: 'large',
    },
    'medium',
  ),
  color: () => select(
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
storiesOf('Molecules/IconButton', module)
  .addDecorator(alignCenterDecorator)
  .addDecorator(withInfoDecorator(JuiIconButton, { inline: true }))
  .addWithJSX('plain', () => {
    return (
      <Wrapper>
        <JuiIconButton
          className="iconButtonWrapper"
          onClick={action('clicked')}
          variant="plain"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="add"
        >
          add_circle
        </JuiIconButton>
        <JuiIconButton
          className="iconButtonWrapper"
          onClick={action('clicked')}
          variant="plain"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="remove"
        >
          remove_circle
        </JuiIconButton>
        <JuiIconButton
          className="iconButtonWrapper"
          onClick={action('clicked')}
          variant="plain"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="add"
        >
          add_circle_outlined
        </JuiIconButton>
        <JuiIconButton
          className="iconButtonWrapper"
          onClick={action('clicked')}
          variant="plain"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="remove"
        >
          remove_circle_outlined
        </JuiIconButton>
      </Wrapper>
    );
  })
  .addWithJSX('round', () => {
    return (
      <Wrapper>
        <JuiIconButton
          className="iconButtonWrapper"
          onClick={action('clicked')}
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
          onClick={action('clicked')}
          variant="round"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="like"
        >
          favorite
        </JuiIconButton>
        <JuiIconButton
          className="iconButtonWrapper"
          onClick={action('clicked')}
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
          onClick={action('clicked')}
          variant="round"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="like"
        >
          favorite_border
        </JuiIconButton>
      </Wrapper>
    );
  });
