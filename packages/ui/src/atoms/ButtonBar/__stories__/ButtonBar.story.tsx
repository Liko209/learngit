/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-30 23:02:14
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs/react';
import { withInfoDecorator, alignCenterDecorator } from '../../../utils/decorators';
import { JuiButtonBar } from '../index';
import JuiIconButton from '../../../molecules/IconButton/IconButton';
import JuiCheckboxButton from '../../../molecules/CheckboxButton/CheckboxButton';

const getKnobs = () => {
  const direction = select(
    'direction',
    {
      vertical: 'vertical',
      horizontal: 'horizontal',
    },
    'horizontal',
  );

  const size = select(
    'size',
    {
      small: 'small',
      medium: 'medium',
      large: 'large',
    },
    'medium',
  );

  const overlapping = boolean('overlapping', false);
  const invisible = boolean('invisible', false);
  const awake = boolean('awake', false);
  return {
    direction,
    size,
    overlapping,
    invisible,
    awake,
  };
};
storiesOf('Atoms/ButtonBar', module)
  .addDecorator(alignCenterDecorator)
  .addDecorator(withInfoDecorator(JuiButtonBar, { inline: true }))
  .addWithJSX('Plain Icon Button Bar', () => {
    const { size, ...rest } = getKnobs();
    return (
      <div>
        <JuiButtonBar {...rest}>
          <JuiIconButton variant="plain" size={size} tooltipTitle="like">favorite</JuiIconButton>
          <JuiIconButton variant="plain" size={size} tooltipTitle="like">favorite</JuiIconButton>
          <JuiIconButton variant="plain" size={size} tooltipTitle="like">favorite</JuiIconButton>
          <JuiIconButton variant="plain" size={size} tooltipTitle="like">favorite</JuiIconButton>
        </JuiButtonBar>
      </div>
    );
  })
  .addWithJSX('Round Icon Button Bar', () => {
    const { size, ...rest } = getKnobs();
    return (
      <div>
        <JuiButtonBar {...rest}>
          <JuiIconButton variant="round" size={size} tooltipTitle="like">favorite</JuiIconButton>
          <JuiIconButton variant="round" size={size} tooltipTitle="like">favorite</JuiIconButton>
          <JuiIconButton variant="round" size={size} tooltipTitle="like">favorite</JuiIconButton>
          <JuiIconButton variant="round" size={size} tooltipTitle="like">favorite</JuiIconButton>
        </JuiButtonBar>
      </div>
    );
  })
  .addWithJSX('Checkbox Button Bar', () => {
    const { size, ...rest } = getKnobs();
    return (
      <div>
        <JuiButtonBar {...rest}>
          <JuiCheckboxButton size={size} tooltipTitle="favorite" iconName="star_border" checkedIconName="star">favorite</JuiCheckboxButton>
          <JuiCheckboxButton size={size} tooltipTitle="favorite" iconName="star_border" checkedIconName="star">favorite</JuiCheckboxButton>
          <JuiCheckboxButton size={size} tooltipTitle="favorite" iconName="star_border" checkedIconName="star">favorite</JuiCheckboxButton>
          <JuiCheckboxButton size={size} tooltipTitle="favorite" iconName="star_border" checkedIconName="star">favorite</JuiCheckboxButton>
        </JuiButtonBar>
      </div>
    );
  });
