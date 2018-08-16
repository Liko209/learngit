import React from 'react';
import styled from 'styled-components';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { Presence } from '.';

const StyledWrapper = styled.div`
  display: flex;
`;
const Wrapper = (props: { children: any }) => <StyledWrapper>{props.children}</StyledWrapper>;

storiesOf('Atoms/Presence', module)
  .add('status', withInfo({ inline: true })(() => {
    return (
      <div>
        <Wrapper><Presence status="online" /> online</Wrapper>
        <Wrapper><Presence status="away" /> away</Wrapper>
        <Wrapper><Presence status="offline" /> offline</Wrapper>
      </div>
    );
  }));
