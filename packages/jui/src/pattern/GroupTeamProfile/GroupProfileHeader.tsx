/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { JuiIconography } from '../../foundation/Iconography';
import styled from '../../foundation/styled-components';
// import {
//   shape,
//   spacing,
//   typography,
//   palette,
// } from '../../foundation/utils/styles';
import { GroupHeaderProps } from './types';

const StyledHeader = styled.div`
  height: 64px;
  width: 100%;
  background-color: #fff;
  line-height: 64px;
  color: #212121;
  font-size: 20px;
  border-bottom: 1px solid #e0e0e0;
`;
const StyledContent = styled.div`
  display: flex;
  height: 64px;
  align-items: center;
  justify-content: space-between;
  margin: 0 24px;
`;
const StyledIcon = styled.p`
  color: #9e9e9e;
  font-size: 20px;
  .options {
    margin-right: 12px;
  }
`;
const StyledText = styled.p`
  color: #212121;
  font-size: 20px;
`;
class JuiGroupProfileHeader extends PureComponent<GroupHeaderProps> {
  render() {
    const { text, destroy } = this.props;

    return (
      <StyledHeader>
        <StyledContent>
          <StyledText>
            {text}
          </StyledText>
          <StyledIcon>
            <JuiIconography className="options">more_horiz</JuiIconography>
            <JuiIconography onClick={destroy}>close</JuiIconography>
          </StyledIcon>
        </StyledContent>
      </StyledHeader>
    );
  }
}

export { JuiGroupProfileHeader };
