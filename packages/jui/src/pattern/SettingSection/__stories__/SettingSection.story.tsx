/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-02 15:14:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiSettingSection } from '../SettingSection';

const getTitleKnob = () => text('title', 'SettingSection');
const getContentKnob = () => text('content', 'Setting Items Here');
storiesOf('Pattern/Setting', module)
  .addDecorator(withInfoDecorator(JuiSettingSection, { inline: true }))
  .add('SettingSection', () => {
    return (
      <div>
        <JuiSettingSection title={getTitleKnob()}>
          {getContentKnob()}
        </JuiSettingSection>
        <JuiSettingSection title={getTitleKnob()}>
          {getContentKnob()}
        </JuiSettingSection>
      </div>
    );
  });
