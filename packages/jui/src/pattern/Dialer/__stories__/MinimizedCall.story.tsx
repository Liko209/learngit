/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-05 13:45:31
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiFabButton } from '../../../components/Buttons';

import { JuiMinimizedCall } from '..';

const End = () => (
  <JuiFabButton
    color="semantic.negative"
    size="medium"
    showShadow={false}
    tooltipPlacement="top"
    iconName="hand_up"
    tooltipTitle="End"
  />
);

End.displayName = 'End';

const Mute = () => (
  <JuiFabButton
    color="common.white"
    size="medium"
    showShadow={false}
    tooltipPlacement="top"
    iconName="mic"
    tooltipTitle="Mute"
  />
);

Mute.displayName = 'Mute';

const Actions = [End, Mute];

storiesOf('Pattern', module).add('Minimized Call', () => {
  return (
    <JuiMinimizedCall name="Terry Webster" label="02:32" Actions={Actions} />
  );
});
