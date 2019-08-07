/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-26 10:56:31
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import {
  width,
  height,
  spacing,
  typography,
  grey,
} from '../../foundation/utils';
import * as EmptyScreen from './style';
import { JuiEmptyScreenProps } from './types';

const Wrapper = styled(EmptyScreen.Wrapper)`
  width: ${width(66)};
  padding: ${spacing(20, 10, 0)};
  align-items: flex-start;
`;

const Pic = styled(EmptyScreen.Pic)`
  min-width: ${width(47)};
  min-height: ${height(37)};
  width: ${width(47)};
  height: ${height(37)};
  margin: ${spacing(0, 0, 8)};
`;

const Text = styled(EmptyScreen.Text)`
  ${typography('headline')};
`;

const Content = styled(EmptyScreen.Content)`
  color: ${grey('500')};
  margin: ${spacing(0, 0, 2)};
`;

const JuiFlexWrapper = styled.div`
  display: flex;
  justify-content: center;
  overflow-y: auto;
  height: 100%;
`;

const JuiRightShelfEmptyScreen = React.memo((props: JuiEmptyScreenProps) => {
  const { image, text, content, actions } = props;
  /* eslint-disable react/no-array-index-key */
  return (
    <Wrapper>
      <Pic src={image} />
      <Text data-test-automation-id="right-shelf-empty-screen-text">
        {text}
      </Text>
      <Content data-test-automation-id="right-shelf-empty-screen-content">
        {content}
      </Content>
      <EmptyScreen.Actions>
        {actions.length
          ? actions.map((action, inx) => (
              <EmptyScreen.ActionWrapper key={inx}>
                {action}
              </EmptyScreen.ActionWrapper>
            ))
          : actions}
      </EmptyScreen.Actions>
    </Wrapper>
  );
});

export { JuiRightShelfEmptyScreen, JuiFlexWrapper };
