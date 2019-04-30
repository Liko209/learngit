/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-31 19:14:32
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs';
import {
  withInfoDecorator,
  alignCenterDecorator,
} from '../../../../foundation/utils/decorators';
import { JuiCheckboxButton, JuiCheckboxButtonProps } from '..';
import styled from '../../../../foundation/styled-components';

const Wrapper = styled.div`
  .checkboxButtonWrapper {
    margin-right: 20px;
  }
`;

function getKnobs() {
  const content = text('content', 'button');
  const size = select<JuiCheckboxButtonProps['size']>(
    'size',
    {
      small: 'small',
      medium: 'medium',
      large: 'large',
    },
    'large',
  );
  const color = select<JuiCheckboxButtonProps['color']>(
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
  const checked = boolean('checked', false);
  return {
    content,
    size,
    color,
    disabled,
    awake,
    invisible,
    checked,
  };
}

storiesOf('Components/CheckboxButton', module)
  .addDecorator(alignCenterDecorator)
  .addDecorator(withInfoDecorator(JuiCheckboxButton, { inline: true }))
  .add('CheckboxButton', () => {
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
          iconName="unlock"
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
