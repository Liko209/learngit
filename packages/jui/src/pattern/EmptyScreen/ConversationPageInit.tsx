/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-07 13:30:23
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import { width, height } from '../../foundation/utils';
import * as EmptyScreen from './style';
import { JuiEmptyScreenProps } from './';

const Pic = styled(EmptyScreen.Pic)`
  width: ${width(67)};
  height: ${height(53)};
`;

const JuiConversationPageInit = React.memo((props: JuiEmptyScreenProps) => {
  const { image, text, actions } = props;

  return (
    <EmptyScreen.Wrapper>
      <Pic src={image} />
      <EmptyScreen.Text>{text}</EmptyScreen.Text>
      <EmptyScreen.Actions>
        {actions.length
          ? actions.map((action, inx) => (
              <EmptyScreen.ActionWrapper key={inx}>
                {action}
              </EmptyScreen.ActionWrapper>
            ))
          : actions}
      </EmptyScreen.Actions>
    </EmptyScreen.Wrapper>
  );
});

export { JuiConversationPageInit };
