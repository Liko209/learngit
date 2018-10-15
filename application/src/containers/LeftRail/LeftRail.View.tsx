/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:28
 * Copyright © RingCentral. All rights reserved.
 */

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
