/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-30 23:02:14
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs/react';
import {
  withInfoDecorator,
  alignCenterDecorator,
} from '../../../../foundation/utils/decorators';
import { JuiButtonBar } from '../index';
import { JuiIconButton } from '../../IconButton/IconButton';
import { JuiCheckboxButton } from '../../CheckboxButton/CheckboxButton';

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
storiesOf('Molecules/ButtonBar', module)
  .addDecorator(alignCenterDecorator)
  .addDecorator(withInfoDecorator(JuiButtonBar, { inline: true }))
  .addWithJSX('Plain Icon Button Bar', () => {
    return (
      <div>
        <JuiButtonBar {...getKnobs()}>
          <JuiIconButton variant="plain" tooltipTitle="like">
            favorite
          </JuiIconButton>
          <JuiIconButton variant="plain" tooltipTitle="like">
            favorite
          </JuiIconButton>
          <JuiIconButton variant="plain" tooltipTitle="like">
            favorite
          </JuiIconButton>
          <JuiIconButton variant="plain" tooltipTitle="like">
            favorite
          </JuiIconButton>
        </JuiButtonBar>
      </div>
    );
  })
  .addWithJSX('Round Icon Button Bar', () => {
    return (
      <div>
        <JuiButtonBar {...getKnobs()}>
          <JuiIconButton variant="round" tooltipTitle="like">
            favorite
          </JuiIconButton>
          <JuiIconButton variant="round" tooltipTitle="like">
            favorite
          </JuiIconButton>
          <JuiIconButton variant="round" tooltipTitle="like">
            favorite
          </JuiIconButton>
          <JuiIconButton variant="round" tooltipTitle="like">
            favorite
          </JuiIconButton>
        </JuiButtonBar>
      </div>
    );
  })
  .addWithJSX('Checkbox Button Bar', () => {
    return (
      <div>
        <JuiButtonBar {...getKnobs()}>
          <JuiCheckboxButton
            tooltipTitle="favorite"
            iconName="star_border"
            checkedIconName="star"
          >
            favorite
          </JuiCheckboxButton>
          <JuiCheckboxButton
            tooltipTitle="favorite"
            iconName="star_border"
            checkedIconName="star"
          >
            favorite
          </JuiCheckboxButton>
          <JuiCheckboxButton
            tooltipTitle="favorite"
            iconName="star_border"
            checkedIconName="star"
          >
            favorite
          </JuiCheckboxButton>
          <JuiCheckboxButton
            tooltipTitle="favorite"
            iconName="star_border"
            checkedIconName="star"
          >
            favorite
          </JuiCheckboxButton>
        </JuiButtonBar>
      </div>
    );
  });
