/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-21 17:43:53
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean } from '@storybook/addon-knobs';
import { JuiSettingItem } from '../DialogSettingItem';
import { JuiSettingContainer } from '../DialogSettingContainer';

const getLabelKnob = () => text('title', 'DialogSettingItem Label');
const getContentKnob = () => text('content', 'DialogSettingItem Element');
const isDisabled = () => boolean('disabled', false);
const isIndented = () => boolean('indent', false);
const hasDivider = () => boolean('divider', false);
storiesOf('Pattern/DialogSetting', module).add('SettingItem', () => (
  <JuiSettingContainer>
    <JuiSettingItem
      id={'0'}
      disabled={isDisabled()}
      label={getLabelKnob()}
      indent={isIndented()}
      divider={hasDivider()}
    >
      {getContentKnob()}
    </JuiSettingItem>
    <JuiSettingItem
      id={'1'}
      disabled={isDisabled()}
      label={getLabelKnob()}
      indent={isIndented()}
      divider={hasDivider()}
    >
      {getContentKnob()}
    </JuiSettingItem>
  </JuiSettingContainer>
));
