/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-31 19:14:32
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs';
import { alignCenterDecorator } from '../../../../foundation/utils/decorators';
import { JuiCheckboxButton, JuiCheckboxButtonProps } from '..';
import styled from '../../../../foundation/styled-components';
import star from '../../../../assets/jupiter-icon/icon-star.svg';
import starBorder from '../../../../assets/jupiter-icon/icon-star_border.svg';
import lock from '../../../../assets/jupiter-icon/icon-lock.svg';
import unlock from '../../../../assets/jupiter-icon/icon-unlock.svg';

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
  .add('CheckboxButton', () => {
    const { content, ...rest } = getKnobs();
    return (
      <Wrapper>
        <JuiCheckboxButton
          className="checkboxButtonWrapper"
          icon={starBorder}
          checkedIcon={star}
          tooltipTitle="like"
          checked={true}
          {...rest}
        />
        <JuiCheckboxButton
          className="checkboxButtonWrapper"
          icon={unlock}
          checkedIcon={lock}
          tooltipTitle="lock"
          {...rest}
        />
      </Wrapper>
    );
  });
