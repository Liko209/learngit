/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-06-25 14:10:58
 * Copyright © RingCentral. All rights reserved.
 */
import React, { RefObject } from 'react';
import { JuiListItem } from '../../components/Lists';
import styled from '../../foundation/styled-components';
import {
  spacing,
  typography,
  grey,
  width,
  height,
} from '../../foundation/utils/styles';

type Props = {
  ref: RefObject<any>;
  children: React.ReactNode;
};

const RecentCallContainer = styled.div<{}>`
  && {
    position: relative;
    width: 100%;
    position: relative;
    height: 100%;
    flex: 1;
    min-height: 0;
  }
`;

const StyledRecentCalls = styled.div`
  && {
    margin-top: ${spacing(11)};
    height: calc(100% - ${spacing(11)});
    overflow: hidden;
  }
`;

const JuiRecentCallItem = styled(JuiListItem)`
  && {
    justify-content: space-between;
    padding: ${spacing(2, 4)};
    cursor: pointer;
  }
`;

const StyledContactWrapper = styled.div`
  min-width: 0;
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: right;
    width: ${width(17)};
  }
`;

const StyledSelectedItemIcon = styled.div`
  height: ${height(5)};
  text-align: center;
`;

const JuiRecentCalls = React.forwardRef((props: Props, ref: RefObject<any>) => {
  const { children } = props;
  return <StyledRecentCalls ref={ref}>{children}</StyledRecentCalls>;
});

export {
  JuiRecentCalls,
  JuiRecentCallItem,
  RecentCallContainer,
  StyledContactWrapper,
  StyledCallLogStatusWrapper,
  StyledTime,
  StyledSelectedItemIcon,
};
