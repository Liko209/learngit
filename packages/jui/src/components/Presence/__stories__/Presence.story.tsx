/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:36:33
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
import { storiesOf } from '@storybook/react';
import { JuiPresence, PRESENCE } from '../index';

const StyledWrapper = styled.div`
  display: flex;
  padding: 10px;
`;
const Wrapper = (props: { children: any }) => (
  <StyledWrapper>{props.children}</StyledWrapper>
);
const StyledText = styled.span`
  margin-left: 5px;
`;

storiesOf('Components', module).add('Presence🔜', () => {
  return (
    <div>
      <Wrapper>
        <JuiPresence presence={PRESENCE.AVAILABLE} />
        <StyledText>Avaiable</StyledText>
      </Wrapper>
      <Wrapper>
        <JuiPresence presence={PRESENCE.INMEETING} />
        <StyledText>InMeeting</StyledText>
      </Wrapper>
      <Wrapper>
        <JuiPresence presence={PRESENCE.DND} />
        <StyledText>DND</StyledText>
      </Wrapper>
      <Wrapper>
        <JuiPresence presence={PRESENCE.UNAVAILABLE} />
        <StyledText>Unavailable</StyledText>
      </Wrapper>
      <Wrapper>
        <JuiPresence presence={PRESENCE.NOTREADY} />
        <StyledText>NotReady</StyledText>
      </Wrapper>
      <Wrapper>
        <JuiPresence presence={PRESENCE.ONCALL} />
        <StyledText>OnCall</StyledText>
      </Wrapper>
    </div>
  );
});
