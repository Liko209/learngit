/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-30 23:02:14
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, number } from '@storybook/addon-knobs';
import {
  withInfoDecorator,
  alignCenterDecorator,
} from '../../../../foundation/utils/decorators';
import { JuiButtonBar, JuiButtonBarProps } from '../index';
import { JuiIconButton } from '../../IconButton/IconButton';
import { JuiCheckboxButton } from '../../CheckboxButton/CheckboxButton';

const getKnobs = () => {
  const direction = select<JuiButtonBarProps['direction']>(
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

  const overlapSize = number('overlapSize', 0);
  const invisible = boolean('invisible', false);
  const awake = boolean('awake', false);
  return {
    direction,
    size,
    overlapSize,
    invisible,
    awake,
  };
};
storiesOf('Components/ButtonBar', module)
  .addDecorator(alignCenterDecorator)
  .addDecorator(withInfoDecorator(JuiButtonBar, { inline: true }))
  .add('Plain Icon Button Bar', () => {
    return (
      <div>
        <JuiButtonBar {...getKnobs()}>
          <JuiIconButton variant="plain" tooltipTitle="like">
            refresh
          </JuiIconButton>
          <JuiIconButton variant="plain" tooltipTitle="like">
            refresh
          </JuiIconButton>
          <JuiIconButton variant="plain" tooltipTitle="like">
            refresh
          </JuiIconButton>
          <JuiIconButton variant="plain" tooltipTitle="like">
            refresh
          </JuiIconButton>
        </JuiButtonBar>
      </div>
    );
  })
  .add('Round Icon Button Bar', () => {
    return (
      <div>
        <JuiButtonBar {...getKnobs()}>
          <JuiIconButton variant="round" tooltipTitle="like">
            refresh
          </JuiIconButton>
          <JuiIconButton variant="round" tooltipTitle="like">
            refresh
          </JuiIconButton>
          <JuiIconButton variant="round" tooltipTitle="like">
            refresh
          </JuiIconButton>
          <JuiIconButton variant="round" tooltipTitle="like">
            refresh
          </JuiIconButton>
        </JuiButtonBar>
      </div>
    );
  })
  .add('Checkbox Button Bar', () => {
    return (
      <div>
        <JuiButtonBar {...getKnobs()}>
          <JuiCheckboxButton
            tooltipTitle="favorite"
            iconName="star_border"
            checkedIconName="star"
          />
          <JuiCheckboxButton
            tooltipTitle="favorite"
            iconName="star_border"
            checkedIconName="star"
          />
          <JuiCheckboxButton
            tooltipTitle="favorite"
            iconName="star_border"
            checkedIconName="star"
          />
          <JuiCheckboxButton
            tooltipTitle="favorite"
            iconName="star_border"
            checkedIconName="star"
          />
        </JuiButtonBar>
      </div>
    );
  });
