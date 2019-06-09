/*
 * @Author: isaac.liu
 * @Date: 2019-04-30 09:47:16
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import {
  spacing,
  width,
  height,
  ellipsis,
  typography,
} from '../../../foundation/utils';

const ImageWithSize = (size: number) => styled.img`
  border-radius: 50%;
  width: ${width(size)};
  height: ${height(size)};
`;

const Span = styled.span`
  margin-left: ${spacing(2.5)};
  ${ellipsis()}
`;

type MarkDownViewProps = {
  content?: string;
};

const MarkdownWrapper = styled.div`
  ${typography('body1')};
  ${ellipsis()}
`;

const MarkDownView = (props: MarkDownViewProps) => {
  const { content } = props;
  if (content) {
    return <MarkdownWrapper>{content}</MarkdownWrapper>;
  }
  return null;
};

export { ImageWithSize, Span, MarkDownView, MarkDownViewProps };
