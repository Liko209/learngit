/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:36:33
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { JuiPresence } from '../index';

const StyledWrapper = styled.div`
  display: flex;
`;
const Wrapper = (props: { children: any }) => (
  <StyledWrapper>{props.children}</StyledWrapper>
);

storiesOf('Components', module).add(
  'Presence🔜',
  withInfo({ inline: true })(() => {
    return (
      <div>
        <Wrapper>
          <JuiPresence presence="Available" /> Available
        </Wrapper>
        <Wrapper>
          <JuiPresence presence="InMeeting" /> InMeeting
        </Wrapper>
        <Wrapper>
          <JuiPresence presence="Unavailable" /> Unavailable
        </Wrapper>
      </div>
    );
  }),
);
