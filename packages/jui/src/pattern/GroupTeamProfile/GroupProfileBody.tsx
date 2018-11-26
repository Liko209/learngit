/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 14:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { JuiIconography } from '../../foundation/Iconography';
import styled from '../../foundation/styled-components';
import { GroupBodyProps } from './types';
import {
  spacing,
  grey,
  height,
  width,
} from '../../foundation/utils/styles';

const StyledBodyWrapper = styled.div`
  border-bottom: 1px solid ${grey('300')};
`;
const StyledContent = styled.div`
  display: flex;
  margin: ${spacing(5)} ${spacing(6)} ${spacing(5)} ${spacing(6)};
`;
const StyledAvatar = styled.div`
  img {
    width: ${width(20)};
    height: ${height(20)};
  }
`;
const StyledRightColumn = styled.div`
  position: relative;
  width: 100%;
  margin-left: ${spacing(2.5)};
`;
const StyledName = styled.div`
  position: relative;
  top: 0;
  left: 0;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;
const StyledDescription = styled.div`
  margin-top: ${spacing(1.5)};
  color: ${grey('500')};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;
const StyledBottomButton = styled.div`
  margin-top: ${spacing(3)};
  display: flex;
`;
const StyledMessageBtn = styled.div`
  display: flex;
  color: #0684bd;
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  span {
    font-size: ${({ theme }) => theme.typography.h6.fontSize};
    margin-right: ${spacing(3)};
  }
`;
class JuiGroupProfileBody extends PureComponent<GroupBodyProps> {
  render() {
    const { displayName, description, avatar } = this.props;
    return (
      <StyledBodyWrapper>
        <StyledContent>
          <StyledAvatar>
            {avatar}
          </StyledAvatar>
          <StyledRightColumn>
            <StyledName>{displayName}</StyledName>
            {description ? (
              <StyledDescription>{description}</StyledDescription>
            ) : null}
            <StyledBottomButton>
              <StyledMessageBtn>
                <JuiIconography>chat_bubble</JuiIconography>
                Message
              </StyledMessageBtn>
            </StyledBottomButton>
          </StyledRightColumn>
        </StyledContent>
      </StyledBodyWrapper>
    );
  }
}

export { JuiGroupProfileBody };
