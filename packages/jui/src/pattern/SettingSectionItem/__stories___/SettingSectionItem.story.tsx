/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-02 15:14:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean } from '@storybook/addon-knobs';
import { JuiSettingSectionItem } from '../SettingSectionItem';

const getLabelKnob = () => text('title', 'SettingSectionItem');
const getDescriptionKnob = () => text('description', 'SettingSectionItem Descriptions');
const getLongDescriptionKnob = () => text(
  'description',
  'Visual primitives for the component age. Use the best bits of ES6 and CSS to style your apps without stress!',
);
const isDisabled = () => boolean('disabled', false);

const getContentKnob = () => text('content', 'Setting Items Here');
storiesOf('Pattern/Setting', module).add('SettingSectionItem', () => (
    <div>
      <JuiSettingSectionItem
        id={'0'}
        label={getLabelKnob()}
        disabled={isDisabled()}
      >
        {getContentKnob()}
      </JuiSettingSectionItem>
      <JuiSettingSectionItem
        id={'1'}
        label={getLabelKnob()}
        description={getDescriptionKnob()}
        disabled={isDisabled()}
      >
        {getContentKnob()}
      </JuiSettingSectionItem>
      <JuiSettingSectionItem
        id={'2'}
        label={getLabelKnob()}
        description={getLongDescriptionKnob()}
        disabled={isDisabled()}
      >
        {getContentKnob()}
      </JuiSettingSectionItem>
      <JuiSettingSectionItem
        id={'3'}
        label={getLabelKnob()}
        description={getDescriptionKnob()}
        disabled={isDisabled()}
      >
        {getContentKnob()}
      </JuiSettingSectionItem>
    </div>
));
