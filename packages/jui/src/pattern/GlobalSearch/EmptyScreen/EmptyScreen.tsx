/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-09 11:14:52
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import styled from '../../../foundation/styled-components';
import { width, height, spacing, typography, grey } from '../../../foundation/utils';
import image from './img/no-result.svg';

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

const Pic = styled.img`
  width: ${width(100)};
  height: ${height(80)};
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
      <Pic src={image} />
      <Text>{text}</Text>
    </Wrapper>
  );
});

export { JuiEmptyScreen, JuiEmptyScreenProps };
