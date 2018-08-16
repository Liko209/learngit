import React, { Fragment } from 'react';
import styled from 'styled-components';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { Presence } from '.';

const Item = styled.div`
  display: flex;
`;

storiesOf('Atoms/Presence', module)
  .add('status', withInfo(``)(() => {
    return (
      <Fragment>
        <Item><Presence status="online" /> online</Item>
        <Item><Presence status="away" /> away</Item>
        <Item><Presence status="offline" /> offline</Item>
      </Fragment>
    );
  }));
