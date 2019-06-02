/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import { storiesOf } from '@storybook/react';
import { JuiBadge } from '../index';

const Wrapper = styled.div`
  margin-left: 20px;
`;

storiesOf('Components/Badges', module)
  .add('Simple Badge', () => (
    <div>
      <div>
        <JuiBadge badgeContent={1} color="primary">
          <button>primary</button>
        </JuiBadge>
      </div>
      <br />
      <div>
        <JuiBadge badgeContent={10} color="secondary">
          <button>secondary</button>
        </JuiBadge>
      </div>
    </div>
  ))
  .add('Placement', () => (
    <Wrapper>
      <div>
        <JuiBadge badgeContent={1} color="primary" placement="top-left">
          <button>top-left</button>
        </JuiBadge>
        <JuiBadge badgeContent={1} color="primary">
          <button>top-right</button>
        </JuiBadge>
      </div>
      <div>
        <JuiBadge badgeContent={1} color="primary" placement="bottom-left">
          <button>bottom-left</button>
        </JuiBadge>
        <JuiBadge badgeContent={1} color="primary" placement="bottom-right">
          <button>bottom-right</button>
        </JuiBadge>
      </div>
    </Wrapper>
  ))
  .add('Customized Badge', () => (
    <div>
      <JuiBadge badgeContent={<input type="checkbox" />}>
        <button>I have special badge</button>
      </JuiBadge>
    </div>
  ));
