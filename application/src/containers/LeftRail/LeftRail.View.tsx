import React from 'react';
import styled from 'jui/foundation/styled-components';
import { JuiDivider } from 'jui/components/Divider';

import { Section } from './Section';
import { LeftRailViewProps } from './types';

const Wrapper = styled.div`
  height: 100%;
  overflow: auto;
  border-right: 1px solid ${({ theme }) => theme.palette.divider};
`;

const LeftRailView = (props: LeftRailViewProps) => {
  return (
    <Wrapper>
      {props.sections.map((type, index) => [
        index ? <JuiDivider key="divider" /> : null,
        <Section key={type} type={type} />,
      ])}
    </Wrapper>
  );
};

export { LeftRailView };
