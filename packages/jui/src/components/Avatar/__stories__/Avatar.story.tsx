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
import TeamAvatar from '../../../assets/jupiter-icon/icon-default-team-avatar.svg';

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
        mask={knobs.mask()}
        onClick={action('click')}
      >
        SH
      </JuiAvatar>
    );
  })
  .add('Icon', () => {
    return <JuiAvatar size={knobs.size()} iconSymbol={TeamAvatar} />;
  })
  .add('With presence', () => {
    return (
      <JuiAvatar
        size={knobs.size()}
        color={knobs.color()}
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
  })
  .add('Cover Name', () => {
    return (
      <JuiAvatar
        size={knobs.size()}
        color={knobs.color()}
        mask={knobs.mask()}
        cover
      >
        SH
      </JuiAvatar>
    );
  });
