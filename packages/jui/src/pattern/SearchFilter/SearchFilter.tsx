/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-08 20:14:01
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { spacing, grey, typography, width } from '../../foundation/utils';

type JuiSearchFilterProps = {
  title: string;
  children: React.ReactNode;
};

const StyledSearchFilter = styled.div`
  display: flex;
  flex-direction: column;
  width: 33.5%;
  min-width: ${width(37.75)};
  color: ${grey('700')};
  ${typography('body1')};
  border-left: 1px solid ${grey('300')};
`;

const StyledSearchFilterHeader = styled.div`
  padding: ${spacing(3, 0, 1, 4)};
`;

const StyledSearchFilterBody = styled.div`
  padding: ${spacing(0, 4)};
`;

const JuiSearchFilter = React.memo((props: JuiSearchFilterProps) => {
  const { children, title } = props;
  return (
    <StyledSearchFilter>
      <StyledSearchFilterHeader>{title}</StyledSearchFilterHeader>
      <StyledSearchFilterBody>{children}</StyledSearchFilterBody>
    </StyledSearchFilter>
  );
});

JuiSearchFilter.displayName = 'JuiSearchFilter';

export { JuiSearchFilter, JuiSearchFilterProps };
