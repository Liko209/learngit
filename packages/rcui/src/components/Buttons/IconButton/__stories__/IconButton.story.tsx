import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select } from '@storybook/addon-knobs';
import { alignCenterDecorator } from '../../../../storybook/decorators';

import RuiIconButton, { ToggleIconButton, Group, Capsule, FloatIcon } from '..';
import styled from '../../../../foundation/styled-components';

const Wrapper = styled.div`
  background-color: #eeeeee;
  padding: 12px 0;
`;

const knobs = {
  size: () =>
    select(
      'size',
      {
        small: 'small',
        medium: 'medium',
        large: 'large',
        xlarge: 'xlarge',
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
  variant: () =>
    select(
      'variant',
      {
        normal: 'normal',
        capsule: 'capsule',
      },
      'normal',
    ),
  invisible: () => boolean('invisible', false),
  disabled: () => boolean('disabled', false),
  active: () => boolean('active', true),
  FloatSize: () =>
    select(
      'floatSize',
      {
        small: 'small',
        medium: 'medium',
        large: 'large',
      },
      'medium',
    ),
  FloatColor: () =>
    select(
      'floatColor',
      {
        primary: 'primary',
        secondary: 'secondary',
        inherit: 'inherit',
      },
      'inherit',
    ),
  capsuleSize: () =>
    select(
      'size',
      {
        small: 'small',
        medium: 'medium',
        large: 'large',
      },
      'medium',
    ),
};
storiesOf('Buttons/IconButtons', module)
  .addDecorator(alignCenterDecorator)
  .add('plain', () => {
    return (
      <RuiIconButton
        variant="plain"
        color={knobs.color()}
        size={knobs.size()}
        disabled={knobs.disabled()}
        invisible={knobs.invisible()}
        tooltipTitle="add"
        icon="star"
      />
    );
  })
  .add('round', () => {
    return (
      <RuiIconButton
        variant="round"
        color={knobs.color()}
        size={knobs.size()}
        disabled={knobs.disabled()}
        invisible={knobs.invisible()}
        tooltipTitle="I'm a star"
        icon="star"
      >
        star
      </RuiIconButton>
    );
  })
  .add('toggle', () => {
    return (
      <ToggleIconButton
        color={knobs.color()}
        size={knobs.size()}
        disabled={knobs.disabled()}
        invisible={knobs.invisible()}
        tooltipTitle="thumbup"
        icon="thumbup"
        active={knobs.active()}
      >
        star
      </ToggleIconButton>
    );
  })
  .add('group', () => {
    return (
      <Wrapper>
        <Group size={knobs.size()}>
          <RuiIconButton
            variant="round"
            color={knobs.color()}
            disabled={knobs.disabled()}
            invisible={knobs.invisible()}
            tooltipTitle="I'm a star"
            icon="star"
          >
            star
          </RuiIconButton>
          <RuiIconButton
            variant="round"
            color={knobs.color()}
            disabled={knobs.disabled()}
            invisible={knobs.invisible()}
            tooltipTitle="I'm a star"
            icon="thumbup"
          >
            thumbup
          </RuiIconButton>
          <RuiIconButton
            variant="round"
            color={knobs.color()}
            disabled={knobs.disabled()}
            invisible={knobs.invisible()}
            tooltipTitle="I'm a call-add"
            icon="call-add"
          >
            call-add
          </RuiIconButton>
          <RuiIconButton
            variant="round"
            color={knobs.color()}
            disabled={knobs.disabled()}
            invisible={knobs.invisible()}
            tooltipTitle="I'm a signal"
            icon="signal-0"
          >
            signal
          </RuiIconButton>
        </Group>
      </Wrapper>
    );
  })
  .add('capsule', () => {
    return (
      <Wrapper>
        <Capsule size={knobs.capsuleSize()}>
          <RuiIconButton
            variant="round"
            color={knobs.color()}
            disabled={knobs.disabled()}
            invisible={knobs.invisible()}
            tooltipTitle="I'm a star"
            icon="star"
          >
            star
          </RuiIconButton>
          <RuiIconButton
            variant="round"
            color={knobs.color()}
            disabled={knobs.disabled()}
            invisible={knobs.invisible()}
            tooltipTitle="I'm a star"
            icon="thumbup"
          >
            thumbup
          </RuiIconButton>
          <RuiIconButton
            variant="round"
            color={knobs.color()}
            disabled={knobs.disabled()}
            invisible={knobs.invisible()}
            tooltipTitle="I'm a call-add"
            icon="call-add"
          >
            call-add
          </RuiIconButton>
          <RuiIconButton
            variant="round"
            color={knobs.color()}
            disabled={knobs.disabled()}
            invisible={knobs.invisible()}
            tooltipTitle="I'm a signal"
            icon="signal-0"
          >
            signal
          </RuiIconButton>
        </Capsule>
      </Wrapper>
    );
  })
  .add('Floating', () => {
    return (
      <FloatIcon
        size={knobs.FloatSize()}
        color={knobs.FloatColor()}
        icon="call-add"
      />
    );
  });
