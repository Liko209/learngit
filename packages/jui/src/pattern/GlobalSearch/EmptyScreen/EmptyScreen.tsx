/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-09 11:14:52
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import styled from '../../../foundation/styled-components';
import { width, spacing, typography, grey } from '../../../foundation/utils';
import image from './img/no-result.svg';
import { Theme } from '../../../foundation/theme/theme';

type Variant = keyof Theme['typography'];
type JuiEmptyScreenProps = {
  text: string;
  imgWidth?: number;
  textVariant?: Variant;
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  margin: auto;
`;

const Pic = styled.img<{ imgWidth: number }>`
  max-width: ${({ imgWidth }) => width(imgWidth)};
`;

const Text = styled.div<{ variant: Variant }>`
  ${({ variant }) => typography(variant)};
  color: ${grey('900')};
  margin-top: ${spacing(10)};
`;

const JuiEmptyScreen = React.memo((props: JuiEmptyScreenProps) => {
  const { text, textVariant = 'headline', imgWidth = 100 } = props;

  return (
    <Wrapper>
      <Pic src={image} imgWidth={imgWidth} />
      <Text variant={textVariant}>{text}</Text>
    </Wrapper>
  );
});

export { JuiEmptyScreen, JuiEmptyScreenProps };
