import React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs';

import { RuiAvatar } from '../Avatar';

import avatar from './img/avatar.jpg';

const knobs = {
  size: () =>
    select(
      'size',
      {
        xs: 'xs',
        sm: 'sm',
        md: 'md',
        lg: 'lg',
      },
      'sm',
    ),

  color: () =>
    select(
      'color',
      {
        lake: 'lake',
        tiffany: 'tiffany',
        cateye: 'cateye',
        grass: 'grass',
        gold: 'gold',
        persimmon: 'persimmon',
        tomato: 'tomato',
      },
      'lake',
    ),
};
storiesOf('Avatar', module)
  .addParameters({ jest: ['Avatar'] })
  .add('Image', () => {
    return <RuiAvatar size={knobs.size()} src={avatar} />;
  })
  .add('Name', () => {
    return (
      <RuiAvatar size={knobs.size()} color={knobs.color()}>
        SH
      </RuiAvatar>
    );
  });
