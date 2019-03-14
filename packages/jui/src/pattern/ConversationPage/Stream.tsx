/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-30 15:56:53
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import { JuiConversationInitialPost } from '../ConversationInitialPost';

type JuiStreamProps = {
  className?: string;
  children?: React.ReactNode[] | React.ReactNode;
  style?: React.CSSProperties;
};

const StyledDiv = styled.div`
  height: 100%;
  & .un-scrollable {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    position: relative;
    ${JuiConversationInitialPost} {
      position: absolute;
      top: 0px;
      width: 100%;
    }
  }
`;

const JuiStream = React.memo(
  React.forwardRef(
    (props: JuiStreamProps, forwardRef: React.RefObject<any>) => {
      return (
        <StyledDiv
          ref={forwardRef}
          {...props}
          data-test-automation-id="jui-stream"
        />
      );
    },
  ),
);

export { JuiStream, JuiStreamProps };
export default JuiStream;
