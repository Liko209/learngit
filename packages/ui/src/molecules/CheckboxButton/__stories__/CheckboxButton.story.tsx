/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-31 19:14:32
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs/react';
import { withInfoDecorator, alignCenterDecorator } from '../../../utils/decorators';
import { JuiCheckboxButton } from '..';
import styled from '../../../styled-components';

const Wrapper = styled.div`
  .checkboxButtonWrapper {
    margin-right: 20px;
  }
`;

function getKnobs() {
  const content = text('content', 'button');
  const size = select(
    'size',
    {
      small: 'small',
      medium: 'medium',
      large: 'large',
    },
    'large',
  );
  const color = select(
    'color',
    {
      primary: 'primary',
      secondary: 'secondary',
    },
    'primary',
  );
  const disabled = boolean('disabled', false);
  const awake = boolean('awake', true);
  const invisible = boolean('invisible', false);
  return {
    content,
    size,
    color,
    disabled,
    awake,
    invisible,
  };
}

storiesOf('Molecules/CheckboxButton', module)
  .addDecorator(alignCenterDecorator)
  .addDecorator(withInfoDecorator(JuiCheckboxButton, { inline: true }))
  .addWithJSX('CheckboxButton', () => {
    const { content, ...rest } = getKnobs();
    return (
      <Wrapper>
        <JuiCheckboxButton
          className="checkboxButtonWrapper"
          iconName="favorite_border"
          checkedIconName="favorite"
          tooltipTitle="like"
          {...rest}
        />
        <JuiCheckboxButton
          className="checkboxButtonWrapper"
          iconName="lock_open"
          checkedIconName="lock"
          tooltipTitle="lock"
          {...rest}
        />
        <JuiCheckboxButton
          className="checkboxButtonWrapper"
          iconName="star_border"
          checkedIconName="star"
          tooltipTitle="favorite"
          {...rest}
        />
      </Wrapper>
    );
  });
