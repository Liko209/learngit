/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-17 14:40:24
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs';

import { JuiAvatar, JuiAvatarProps } from '..';
import { JuiPresence, PRESENCE } from '../../Presence';

import avatar from './img/avatar.jpg';

const knobs = {
  size: () =>
    select<JuiAvatarProps['size']>(
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
  presence: () =>
    select(
      'presence',
      {
        available: PRESENCE.AVAILABLE,
        unavailable: PRESENCE.UNAVAILABLE,
        DND: PRESENCE.DND,
        inMeeting: PRESENCE.INMEETING,
      },
      PRESENCE.AVAILABLE,
    ),
};
storiesOf('Components/Avatar', module)
  .add('Image', () => {
    return <JuiAvatar size={knobs.size()} src={avatar} />;
  })
  .add('Name', () => {
    return (
      <JuiAvatar size={knobs.size()} color={knobs.color()}>
        SH
      </JuiAvatar>
    );
  })
  .add('With presence', () => {
    return (
      <JuiAvatar
        size={knobs.size()}
        color={knobs.color()}
        presence={
          <JuiPresence
            presence={knobs.presence()}
            size={knobs.size()}
            borderSize={knobs.size()}
          />
        }
      >
        SH
      </JuiAvatar>
    );
  });
