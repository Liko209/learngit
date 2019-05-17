/*
 * @Author: isaac.liu
 * @Date: 2019-05-02 08:13:52
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils';
import { MarkDownView } from './base';

type TitleProps = {
  title?: string;
  link?: string;
};

const Wrapper = styled.a`
  margin-bottom: ${spacing(1)};
`;

const Title = (props: TitleProps) => {
  const { title, link } = props;
  if (title || link) {
    return (
      <Wrapper href={link}>
        <MarkDownView content={title} />
      </Wrapper>
    );
  }
  return null;
};

export { Title, TitleProps };
