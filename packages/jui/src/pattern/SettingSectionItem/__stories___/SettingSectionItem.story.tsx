import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiSettingSectionItem } from '../SettingSectionItem';

const getLabelKnob = () => text('title', 'SettingSectionItem');
const getDescriptionKnob = () =>
  text('description', 'SettingSectionItem Descriptions');
const getLongDescriptionKnob = () =>
  text(
    'description',
    'Visual primitives for the component age. Use the best bits of ES6 and CSS to style your apps without stress!',
  );
const isDisabled = () => boolean('disabled', false);

const getContentKnob = () => text('content', 'Setting Items Here');
storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiSettingSectionItem, { inline: true }))
  .add('SettingSectionItem', () => {
    return (
      <div>
        <JuiSettingSectionItem label={getLabelKnob()} disabled={isDisabled()}>
          {getContentKnob()}
        </JuiSettingSectionItem>
        <JuiSettingSectionItem
          label={getLabelKnob()}
          description={getDescriptionKnob()}
          disabled={isDisabled()}
        >
          {getContentKnob()}
        </JuiSettingSectionItem>
        <JuiSettingSectionItem
          label={getLabelKnob()}
          description={getLongDescriptionKnob()}
          disabled={isDisabled()}
        >
          {getContentKnob()}
        </JuiSettingSectionItem>
        <JuiSettingSectionItem
          label={getLabelKnob()}
          description={getDescriptionKnob()}
          disabled={isDisabled()}
        >
          {getContentKnob()}
        </JuiSettingSectionItem>
      </div>
    );
  });
