import React, { StatelessComponent } from 'react';
import styled from 'jui/foundation/styled-components';
import { spacing } from 'jui/foundation/utils';
import { JuiEmptyScreen, JuiEmptyScreenProps } from 'jui/pattern/GlobalSearch';

const Wrapper = styled.div`
  margin-top: ${spacing(4)};
`;

const TabPageEmptyScreen: StatelessComponent<JuiEmptyScreenProps> = (
  props: JuiEmptyScreenProps,
) => (
  <Wrapper>
    <JuiEmptyScreen {...props} />
  </Wrapper>
);

export { TabPageEmptyScreen };
