/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-17 14:40:24
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { select, boolean } from '@storybook/addon-knobs';

import { JuiAvatar, JuiAvatarProps } from '..';
import { JuiPresence, PRESENCE } from '../../Presence';

import avatar from './img/avatar.jpg';
import { JuiIconography } from '../../../foundation/Iconography';
import conference from '../../../assets/jupiter-icon/icon-conference.svg';

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
  cover: () => boolean('cover', false),
  mask: () => boolean('mask', false),
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
    return (
      <JuiAvatar
        size={knobs.size()}
        color={knobs.color()}
        cover={knobs.cover()}
        mask={knobs.mask()}
        src={avatar}
        onClick={action('click')}
      />
    );
  })
  .add('Name', () => {
    return (
      <JuiAvatar
        size={knobs.size()}
        color={knobs.color()}
        cover={knobs.cover()}
        mask={knobs.mask()}
        onClick={action('click')}
      >
        SH
      </JuiAvatar>
    );
  })
  .add('Icon', () => {
    let iconSize: any = knobs.size();
    if (iconSize === 'xlarge') {
      iconSize = 'moreLarge'
    }
    return (
      <JuiAvatar size={knobs.size()} color={knobs.color()}>
        <JuiIconography iconSize={iconSize} iconColor={['primary', '500']} symbol={conference} desc={'ha'} />
      </JuiAvatar>
    );
  })
  .add('With presence', () => {
    return (
      <JuiAvatar
        size={knobs.size()}
        color={knobs.color()}
        cover={knobs.cover()}
        mask={knobs.mask()}
        presence={
          <JuiPresence
            presence={knobs.presence()}
            size={knobs.size()}
            borderSize={knobs.size()}
          />
        }
        onClick={action('click')}
      >
        SH
      </JuiAvatar>
    );
  });
