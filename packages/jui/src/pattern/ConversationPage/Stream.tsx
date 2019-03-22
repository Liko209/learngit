/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-30 15:56:53
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import { JuiConversationInitialPostWrapper } from '../ConversationInitialPost';

// FIXME
// Use any due to issues with type of styled-component
type RefType = React.RefObject<any>;

type JuiStreamProps = {
  className?: string;
  children?: React.ReactNode[] | React.ReactNode;
  style?: React.CSSProperties;
};

const StyledDiv = styled.div`
  min-height: 100%;
  & .un-scrollable {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    position: relative;
    ${JuiConversationInitialPostWrapper} {
      position: absolute;
      top: 0px;
      width: 100%;
    }
  }
`;

const JuiStream = React.memo(
  React.forwardRef((props: JuiStreamProps, forwardRef: RefType) => {
    return (
      <StyledDiv
        ref={forwardRef}
        {...props}
        data-test-automation-id="jui-stream"
      />
    );
  }),
);

export { JuiStream, JuiStreamProps };
export default JuiStream;
