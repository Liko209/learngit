/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-04-29 15:47:08
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
} from '../../foundation/utils/styles';

type Count = {
  time: number;
  unit: string;
};

type Props = {
  countText: string;
  count: Count;
  PreDefines: React.ComponentType<any>[];
  CustomReply: React.ComponentType<any>;
};

const StyledReply = styled.div`
  background-color: ${palette('common', 'white')};
  padding-top: ${spacing(6)};
  height: ${height(99)};
  box-sizing: border-box;
`;

const StyledList = styled(JuiList)`
  && {
    padding: 0;
  }
`;

const StyledCountdown = styled(JuiListItem)`
  && {
    padding: ${spacing(2, 4)};
    height: ${height(10)};
    ${typography('body1')};
    display: inline-block;
    color: ${grey('700')};
    span {
      color: ${palette('primary', 'main')};
    }
  }
`;
/* eslint-disable react/no-array-index-key */
const JuiReply = React.memo((props: Props) => {
  const { countText, count, PreDefines, CustomReply } = props;
  return (
    <StyledReply>
      <StyledCountdown button={false}>
        {countText}
        <span>{count.time}</span>
        {count.unit}
      </StyledCountdown>
      <StyledList>
        {PreDefines &&
          PreDefines.map((PreDefine: React.ComponentType, index) => (
            <PreDefine key={index} />
          ))}
      </StyledList>
      <CustomReply />
    </StyledReply>
  );
});
export { JuiReply };
