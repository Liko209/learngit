/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import { storiesOf } from '@storybook/react';
import { RuiBadge } from '../index';

const Wrapper = styled.div`
  margin-left: 20px;
`;

storiesOf('Components/Badges', module)
  .add('Simple Badge', () => (
    <div>
      <div>
        <RuiBadge badgeContent={1} color="primary">
          <button>primary</button>
        </RuiBadge>
      </div>
      <br />
      <div>
        <RuiBadge badgeContent={10} color="secondary">
          <button>secondary</button>
        </RuiBadge>
      </div>
    </div>
  ))
  .add('Placement', () => (
    <Wrapper>
      <div>
        <RuiBadge badgeContent={1} color="primary" placement="top-left">
          <button>top-left</button>
        </RuiBadge>
        <RuiBadge badgeContent={1} color="primary">
          <button>top-right</button>
        </RuiBadge>
      </div>
      <div>
        <RuiBadge badgeContent={1} color="primary" placement="bottom-left">
          <button>bottom-left</button>
        </RuiBadge>
        <RuiBadge badgeContent={1} color="primary" placement="bottom-right">
          <button>bottom-right</button>
        </RuiBadge>
      </div>
    </Wrapper>
  ))
  .add('Customized Badge', () => (
    <div>
      <RuiBadge badgeContent={<input type="checkbox" />}>
        <button>I have special badge</button>
      </RuiBadge>
    </div>
  ));
