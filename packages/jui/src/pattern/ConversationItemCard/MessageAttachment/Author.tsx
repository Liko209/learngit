/*
 * @Author: isaac.liu
 * @Date: 2019-04-30 09:33:50
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { width, height, spacing, ellipsis } from '../../../foundation/utils';

type AuthorProps = {
  author_name?: string;
  author_link?: string;
  author_icon?: string;
};

const Wrapper = styled.a`
  margin-bottom: ${spacing(5)};
  color: #2f2f2f;
  ${ellipsis()}
`;

const IconWrapper = styled.img`
  border-radius: 50%;
  top: ${spacing(3.5)};
  left: ${spacing(5)};
  width: ${width(8)};
  height: ${height(8)};
  position: absolute;
`;

const NameWrapper = styled.span`
  margin-left: ${spacing(11)};
  ${ellipsis()};
`;

const Author = (props: AuthorProps) => {
  const { author_name, author_link, author_icon } = props;
  if (author_name || author_link) {
    return (
      <Wrapper href={author_link}>
        {author_icon && <IconWrapper src={author_icon} />}
        {author_name && <NameWrapper>{author_name}</NameWrapper>}
      </Wrapper>
    );
  }
  return null;
};

export { Author, AuthorProps };
