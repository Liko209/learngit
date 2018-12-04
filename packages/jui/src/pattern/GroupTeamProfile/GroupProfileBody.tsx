/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 14:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { GroupBodyProps } from './types';
import { height, spacing, grey, typography, palette } from '../../foundation/utils/styles';

const StyledBodyWrapper = styled.div`
  border-bottom: 1px solid ${grey('300')};
  height: 100%;
  &.current {
    background-color: ${palette('primary', '50')};
  }
`;
const StyledContent = styled.div`
  display: flex;
  margin: ${spacing(5)} ${spacing(6)} ${spacing(7)} ${spacing(6)};
`;
const StyledRightColumn = styled.div`
  position: relative;
  width: 100%;
  word-wrap: break-word;
  margin-left: ${spacing(2.5)};
  overflow: hidden;
`;
const StyledName = styled.div`
  position: relative;
  top: 0;
  left: 0;
  ${typography('subheading2')};
`;
const StyledGroupName = styled(StyledName)`
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: ${height(18)};
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
  max-height: ${height(12)};
  line-height: ${height(4)};
`;
const StyledBottomButton = styled.div`
  margin-top: ${spacing(3)};
  display: flex;
`;
const StyledParam = styled.p`
  ${typography('body2')}
`;
class JuiGroupProfileBody extends PureComponent<GroupBodyProps> {
  render() {
    const {
      displayName,
      className,
      description,
      avatar,
      children,
      awayStatus,
      jobTitle,
      isGroup,
    } = this.props;
    return (
      <StyledBodyWrapper className={className}>
        <StyledContent>
          {avatar}
          <StyledRightColumn>
            {!isGroup ? (
              <StyledName>{displayName}</StyledName>
            ) : (
              <StyledGroupName>{displayName}</StyledGroupName>
            )}
            {description ? (
              <StyledDescription>{description}</StyledDescription>
            ) : null}
            {awayStatus ? <StyledParam>{awayStatus}</StyledParam> : null}
            {jobTitle ? <StyledParam>{jobTitle}</StyledParam> : null}
            <StyledBottomButton>{children}</StyledBottomButton>
          </StyledRightColumn>
        </StyledContent>
      </StyledBodyWrapper>
    );
  }
}

export { JuiGroupProfileBody };
