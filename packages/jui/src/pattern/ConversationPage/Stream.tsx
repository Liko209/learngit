/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-30 15:56:53
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';

type JuiStreamProps = {
  className?: string;
  children?: React.ReactNode[] | React.ReactNode;
  style?: React.CSSProperties;
};

const StyledDiv = styled<JuiStreamProps, 'div'>('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
`;

const JuiStream = React.memo((props: JuiStreamProps) => (
  <StyledDiv {...props} data-test-automation-id="jui-stream" />
));

export { JuiStream, JuiStreamProps };
export default JuiStream;
