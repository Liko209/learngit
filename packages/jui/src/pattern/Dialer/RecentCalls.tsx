/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-06-25 14:10:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiList, JuiListItem } from '../../components/Lists';
import styled from '../../foundation/styled-components';
import {
  spacing,
  typography,
  palette,
  height,
  grey,
  width,
} from '../../foundation/utils/styles';

type Props = {
  children: React.ReactNode;
};

const StyledRecentCalls = styled(JuiList)`
  && {
    background-color: ${palette('common', 'white')};
    height: ${height(99)};
    box-sizing: border-box;
  }
`;

const JuiRecentCallItem = styled(JuiListItem)`
  && {
    justify-content: space-between;
    padding: ${spacing(2, 4)};
  }
`;

const StyledContactWrapper = styled.div`
  max-width: ${width(37)};
  flex: 1;
`;

const StyledCallLogStatusWrapper = styled.div`
  text-align: center;
`;

const StyledTime = styled.div`
  && {
    ${typography('caption1')};
    color: ${grey('600')};
    white-space: nowrap;
    text-align: right;
    width: ${width(17)};
  }
`;

const JuiRecentCalls = React.memo((props: Props) => {
  const { children } = props;
  return <StyledRecentCalls>{children}</StyledRecentCalls>;
});

export {
  JuiRecentCalls,
  JuiRecentCallItem,
  StyledContactWrapper,
  StyledCallLogStatusWrapper,
  StyledTime,
};
