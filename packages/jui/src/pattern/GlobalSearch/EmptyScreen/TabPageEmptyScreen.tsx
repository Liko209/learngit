import React, { StatelessComponent } from 'react';
import { JuiEmptyScreen, JuiEmptyScreenProps } from '../EmptyScreen';
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils';

const Wrapper = styled.div`
  margin-top: ${spacing(4)};
`;

const JuiTabPageEmptyScreen: StatelessComponent<JuiEmptyScreenProps> = (
  props: JuiEmptyScreenProps,
) => (
  <Wrapper>
    <JuiEmptyScreen {...props} />
  </Wrapper>
);

export { JuiTabPageEmptyScreen };
