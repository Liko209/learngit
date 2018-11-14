import React, { HTMLAttributes } from 'react';
import styled from '../../foundation/styled-components';

type JuiStreamWrapperProps = HTMLAttributes<HTMLElement>;

const Div = (props: JuiStreamWrapperProps) => (
  <div {...props} data-test-automation-id="jui-stream-wrapper" />
);
const JuiStreamWrapper = styled(Div)`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export { JuiStreamWrapper, JuiStreamWrapperProps };
