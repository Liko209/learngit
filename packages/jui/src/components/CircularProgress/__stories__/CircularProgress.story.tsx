import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import styled from '../../../foundation/styled-components';
import { JuiCircularProgress } from '../CircularProgress';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

const Wrapper = styled.div`
  text-align: center;

  & > * {
    margin-right: 28px;
  }
`;

storiesOf('Atoms/Progress', module)
  .addDecorator(withInfoDecorator(JuiCircularProgress, { inline: true }))
  .addWithJSX('Circular', () => (
    <Wrapper>
      <JuiCircularProgress />
      <JuiCircularProgress size={32} />
      <JuiCircularProgress size={40} />
    </Wrapper>
  ));
