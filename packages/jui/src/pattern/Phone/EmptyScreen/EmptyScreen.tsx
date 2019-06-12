/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-03 18:18:57
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import styled from '../../../foundation/styled-components';
import { spacing, typography, grey } from '../../../foundation/utils';

type JuiEmptyScreenProps = {
  text: string;
  image?: string;
  content?: string;
  actions?: JSX.Element[];
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
`;

const Text = styled.div`
  ${typography('headline')};
  color: ${grey('900')};
  margin-top: ${spacing(10)};
`;

const JuiEmptyScreen = React.memo((props: JuiEmptyScreenProps) => {
  const { text } = props;

  return (
    <Wrapper>
      <Text>{text}</Text>
    </Wrapper>
  );
});

export { JuiEmptyScreen, JuiEmptyScreenProps };
