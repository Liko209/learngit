/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 09:43:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import {
  grey,
  spacing,
  height,
  typography,
} from '../../../foundation/utils/styles';
import { JuiTypography } from '../../../foundation/Typography';
import { JuiLink } from '../../../components/Link';

const SearchTitleWrapper = styled.div`
  padding: ${spacing(0, 4)};
  height: ${height(8)};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchTitleText = styled(JuiTypography)`
  && {
    ${typography('caption1')};
    color: ${grey('500')};
  }
`;

const ShowMoreBtn = styled(JuiLink)`
  text-decoration: none;
`;

type SearchTitleProps = {
  title: String;
  href?: string;
};

const SearchTitle = (props: SearchTitleProps) => {
  const { title, href } = props;

  return (
    <SearchTitleWrapper>
      <SearchTitleText>{title}</SearchTitleText>
      {href && (
        <ShowMoreBtn size="small" href={href}>
          Show More
        </ShowMoreBtn>
      )}
    </SearchTitleWrapper>
  );
};

export { SearchTitle };
